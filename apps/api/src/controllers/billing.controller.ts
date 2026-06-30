import { Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' as any }) : null;

export const createCheckoutSchema = z.object({
  tier: z.enum(['Starter', 'Growth', 'Premium']),
  billingCycle: z.enum(['monthly', 'annual']),
});

// 1. CREATE STRIPE CHECKOUT SESSION
export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  const { tier, billingCycle } = req.body;

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context missing.' });
  }

  try {
    const origin = req.headers.origin || 'http://localhost:3000';

    // Pricing mapping (in USD cents)
    const priceMap: Record<string, { monthly: number; annual: number }> = {
      Starter: { monthly: 4900, annual: 46800 },
      Growth: { monthly: 9900, annual: 94800 },
      Premium: { monthly: 19900, annual: 190800 }
    };

    const priceAmount = billingCycle === 'annual' ? priceMap[tier].annual : priceMap[tier].monthly;

    if (!stripe) {
      console.warn('[Billing] Stripe is not configured. Simulating upgrade for local development...');
      
      // Simulating database plan change for offline/local environments
      const expiry = new Date();
      if (billingCycle === 'annual') {
        expiry.setFullYear(expiry.getFullYear() + 1);
      } else {
        expiry.setMonth(expiry.getMonth() + 1);
      }

      const { error: updateErr } = await supabase
        .from('tenants')
        .update({
          plan: 'ACTIVE',
          trial_ends_at: expiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (updateErr) {
        return res.status(500).json({ success: false, error: `Local upgrade failed: ${updateErr.message}` });
      }

      return res.json({
        success: true,
        data: {
          url: `${origin}/dashboard?upgrade=success&tier=${tier}&cycle=${billingCycle}`
        }
      });
    }

    // Live Stripe flow
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `DinePOS AI ${tier} Subscription`,
            description: `DinePOS AI ${tier} plan subscription (${billingCycle} billing)`
          },
          unit_amount: priceAmount,
        },
        quantity: 1,
      }],
      mode: 'payment', // use payment for standard fixed terms, or setup subscription products
      success_url: `${origin}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?upgrade=cancelled`,
      metadata: {
        tenantId,
        tier,
        billingCycle
      }
    });

    res.json({
      success: true,
      data: { url: session.url }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Stripe session creation error.' });
  }
};

// 2. STRIPE WEBHOOK HANDLER
export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!stripe) {
      return res.status(400).send('Stripe not configured');
    }

    if (endpointSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = req.body;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata && metadata.tenantId) {
        const { tenantId, billingCycle } = metadata;

        const expiry = new Date();
        if (billingCycle === 'annual') {
          expiry.setFullYear(expiry.getFullYear() + 1);
        } else {
          expiry.setMonth(expiry.getMonth() + 1);
        }

        await supabase
          .from('tenants')
          .update({
            plan: 'ACTIVE',
            trial_ends_at: expiry.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', tenantId);

        console.log(`[Billing Webhook] Tenant ${tenantId} plan upgraded to ACTIVE via Stripe.`);
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
