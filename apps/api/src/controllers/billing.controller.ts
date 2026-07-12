import { Request, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';
import { AuthenticatedRequest } from '../middleware/auth.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const defaultStripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-04-10' as any }) : null;

// Helper to get active Stripe client dynamically from platform_settings DB table
const getStripeClient = async (): Promise<{ stripe: Stripe | null; webhookSecret: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'stripe_config')
      .maybeSingle();

    if (!error && data && data.value && data.value.stripeSecretKey) {
      const dbStripe = new Stripe(data.value.stripeSecretKey, { apiVersion: '2024-04-10' as any });
      return { 
        stripe: dbStripe, 
        webhookSecret: data.value.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET || null 
      };
    }
  } catch (err) {
    console.error('[Billing] Error loading Stripe config from database:', err);
  }

  // Fallback to environment variables
  return { 
    stripe: defaultStripe, 
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null 
  };
};

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
    const origin = req.headers.origin || process.env.FRONTEND_URL?.split(',')[0] || 'http://localhost:3000';
    const { stripe: activeStripe } = await getStripeClient();

    // Pricing mapping (in USD cents)
    const priceMap: Record<string, { monthly: number; annual: number }> = {
      Starter: { monthly: 4900, annual: 46800 },
      Growth: { monthly: 9900, annual: 94800 },
      Premium: { monthly: 19900, annual: 190800 }
    };

    const priceAmount = billingCycle === 'annual' ? priceMap[tier].annual : priceMap[tier].monthly;

    if (!activeStripe) {
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
    const session = await activeStripe.checkout.sessions.create({
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
      allow_promotion_codes: true,
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
  const { stripe: activeStripe, webhookSecret: endpointSecret } = await getStripeClient();

  let event: Stripe.Event;

  try {
    if (!activeStripe) {
      return res.status(400).send('Stripe not configured');
    }

    if (endpointSecret && sig) {
      const payload = (req as any).rawBody || req.body;
      event = activeStripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } else {
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).send('Stripe webhook signature verification failed: Missing signature or endpoint secret in production.');
      }
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

// 3. GET STRIPE CONFIG STATUS
export const getStripeConfig = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'stripe_config')
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    const isLinked = !!(data && data.value && data.value.stripeSecretKey);
    res.json({
      success: true,
      data: { isLinked }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. UPDATE/LINK STRIPE CONFIG
export const updateStripeConfig = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const { stripeSecretKey, stripeWebhookSecret } = req.body;

  if (!stripeSecretKey) {
    return res.status(400).json({ success: false, error: 'Stripe Secret Key is required.' });
  }

  try {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({
        key: 'stripe_config',
        value: { stripeSecretKey, stripeWebhookSecret: stripeWebhookSecret || '' },
        updated_at: new Date().toISOString()
      });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      data: { message: 'Stripe credentials configured successfully.' }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. UNLINK STRIPE CONFIG
export const unlinkStripeConfig = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { error } = await supabase
      .from('platform_settings')
      .delete()
      .eq('key', 'stripe_config');

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      data: { message: 'Stripe credentials unlinked successfully.' }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. GET TENANT BILLING INFO
export const getTenantBilling = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('plan, trial_ends_at')
      .eq('id', tenantId)
      .single();

    if (tenantErr || !tenant) {
      return res.status(500).json({ success: false, error: 'Failed to fetch tenant info.' });
    }

    const { data: billing } = await supabase
      .from('tenant_billing')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: activeTerminals } = await supabase
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    res.json({
      success: true,
      data: {
        plan: tenant.plan || 'TRIAL',
        trialEndsAt: tenant.trial_ends_at,
        billing: billing ? {
          id: billing.id,
          plan: billing.plan,
          status: billing.status,
          amount: parseFloat(billing.amount),
          nextBillingDate: billing.next_billing_date,
          createdAt: billing.created_at
        } : null,
        activeTerminals: activeTerminals || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching tenant billing.' });
  }
};

// 7. GET SUBSCRIPTION INVOICES
export const getSubscriptionInvoices = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return res.status(400).json({ success: false, error: 'Tenant context missing.' });

  try {
    const { data: invoices, error } = await supabase
      .from('subscription_invoices')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({
      success: true,
      data: (invoices || []).map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoice_number,
        description: inv.description,
        amount: parseFloat(inv.amount),
        status: inv.status,
        periodStart: inv.period_start,
        periodEnd: inv.period_end,
        paidAt: inv.paid_at,
        createdAt: inv.created_at
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error fetching invoices.' });
  }
};

