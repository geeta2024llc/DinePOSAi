import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase.js';
import { ApiResponse } from '@dineposai/shared-types';

export const conciergeChatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  tableNumber: z.number().optional().default(12),
  tenantId: z.string().uuid('Invalid tenant ID').optional(),
  history: z.array(z.object({
    sender: z.enum(['aura', 'user']),
    text: z.string()
  })).optional().default([]),
});

export const chatWithAura = async (req: Request, res: Response<ApiResponse>) => {
  const { message, tableNumber, tenantId: bodyTenantId, history } = req.body;
  
  // Resolve tenant context (from auth session or request payload)
  let tenantId = (req as any).user?.tenantId || bodyTenantId;
  
  // Fallback: If no tenantId is resolved, fetch the first active tenant to ensure the demo is functional
  if (!tenantId) {
    const { data: firstTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('status', 'ACTIVE')
      .limit(1)
      .maybeSingle();
    tenantId = firstTenant?.id;
  }

  if (!tenantId) {
    return res.status(400).json({ success: false, error: 'Tenant context is required.' });
  }

  try {
    // 1. Fetch available menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, description, price')
      .eq('tenant_id', tenantId)
      .eq('is_available', true);

    const menuContext = menuItems && menuItems.length > 0
      ? menuItems.map(item => `- [${item.id}] ${item.name}: $${item.price}. ${item.description || ''}`).join('\n')
      : 'No active menu items available.';

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const systemPrompt = `You are Aura, the premium AI dining concierge and sommelier for a high-end restaurant. 
The guest is sitting at Table ${tableNumber}.
You must be polite, helpful, and assist the guest with questions about the food, drink pairings, or general menu recommendations.

Here is the current restaurant menu:
${menuContext}

Your response MUST be a JSON object with the following fields:
1. "reply": A string containing your polite response. Use markdown spacing if necessary. Tell the guest about the food/ingredients and why they would enjoy it.
2. "suggestions": An array of 2-3 quick button options for the user (e.g. ["Order Truffle Risotto", "Cocktail Menu"]). Keep them short.
3. "recommendations": An array of maximum 2 menu items matching their request. Each item must have:
   - "id": string (the exact item id from the menu)
   - "name": string (the exact item name)
   - "price": number (the price)
   - "description": string (the item description)

Response format:
{
  "reply": "...",
  "suggestions": ["...", "..."],
  "recommendations": [{"id": "...", "name": "...", "price": 12.3, "description": "..."}]
}

Ensure your response is valid JSON. Only recommend items that are in the menu above.`;

        // Map conversation history
        const contents = history.map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        }));
        
        // Append current message
        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nGuest says: ${message}` }]
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const parsed = JSON.parse(responseText);
            return res.json({
              success: true,
              data: parsed
            });
          }
        }
      } catch (geminiErr) {
        console.error('[Concierge] Gemini API call failed, falling back to rules engine:', geminiErr);
      }
    }

    // 2. Fallback Rules Engine (Smart Keyword Matcher)
    let replyText = "Aura Concierge is analyzing your request. We recommend exploring our chef's signature seasonal entrees or pairing your selections with our reserve wine collection.";
    let suggestions: string[] = ['Cocktail Menu', 'House Specials'];
    let recommendations: any[] = [];

    const query = message.toLowerCase();

    if (query.includes('risotto') || query.includes('truffle')) {
      const match = menuItems?.find(item => item.name.toLowerCase().includes('risotto'));
      replyText = match 
        ? `Our ${match.name} ($${match.price}) features Carnaroli rice, foraged forest mushrooms, and shaved black winter truffle. It is one of our most popular entrees.`
        : "Our Acquerello Mushroom Risotto features premium Carnaroli rice, foraged forest mushrooms, and fresh black winter truffle shavings. It pairs beautifully with a glass of decanted red wine.";
      suggestions = ['Order Risotto', 'Wine Pairings'];
      if (match) {
        recommendations.push({ id: match.id, name: match.name, price: Number(match.price), description: match.description });
      }
    } else if (query.includes('cocktail') || query.includes('drink') || query.includes('menu')) {
      replyText = "Here are our signature house cocktails. I highly recommend the Royal Gold Old Fashioned, prepared with 12-year-old bourbon and smoked with cherrywood chips.";
      suggestions = ['Show Royal Gold', 'Emerald Gimlet'];
    } else if (query.includes('wagyu') || query.includes('meat') || query.includes('steak')) {
      const match = menuItems?.find(item => item.name.toLowerCase().includes('wagyu'));
      replyText = match 
        ? `Our ${match.name} ($${match.price}) features Miyazaki A5 Wagyu seared over binchotan charcoal and brushed with a truffle glaze. It is our premier steak offering.`
        : "Our Gold Leaf A5 Wagyu Ribeye features Miyazaki Wagyu seared over binchotan charcoal and brushed with a truffle glaze. It is our premier steak offering.";
      suggestions = ['Order Wagyu', 'Recommend Pairings'];
      if (match) {
        recommendations.push({ id: match.id, name: match.name, price: Number(match.price), description: match.description });
      }
    } else if (query.includes('sommelier') || query.includes('wine') || query.includes('red')) {
      replyText = "For cellared full-bodied reds, our sommelier highly recommends our Château Margaux or our sommelier pick, the Opus One. Both pair exceptionally well with prime steak.";
      suggestions = ['Opus One details', 'Wine pairings'];
    } else if (query.includes('gluten') || query.includes('gf')) {
      replyText = "We offer excellent gluten-free options, including the Gold Leaf Wagyu Ribeye and the Saffron Crème Brûlée. Please let us know of any severe allergies.";
      suggestions = ['Wagyu details', 'Dessert menu'];
    }

    res.json({
      success: true,
      data: {
        reply: replyText,
        suggestions,
        recommendations
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Error processing concierge request.' });
  }
};
