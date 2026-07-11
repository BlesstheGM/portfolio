import { tool, type ToolSet } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { searchProducts } from './catalog';
import { createOrder, getOrderByShortId } from './db';
import { sendWhatsAppMessage } from './whatsapp';
import { sendOrderConfirmationEmail, notifyAdminOfNewOrder } from './email';

/**
 * Single agent core shared by both surfaces (web chat + WhatsApp webhook).
 * Only the transport differs between /api/chat and /api/whatsapp — the model,
 * tools, and system prompt live here so both channels behave identically.
 */

// Model id is env-overridable: if Google renames/retires the default, set
// GEMINI_MODEL in the environment instead of editing code.
export const model = google(process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite');

export const SYSTEM_PROMPT = `You are a shopping agent for a demo storefront built by Blessing Hlongwane.
You help customers find real products, place a demo order, and check on an existing order.

Rules:
- Product results come from a live product search (real listings, real prices, sourced from Google Shopping via RapidAPI). When describing this to a customer, be specific: say you're searching live Google Shopping listings, not just "real products." Always call the search tool rather than inventing products or prices.
- Prices may be in various currencies depending on the listing; state the currency you see, don't assume ZAR unless that's what the listing shows.
- Every product you list MUST include its link as a markdown link, formatted exactly like this: **Product Name** — R249 [View](https://...). Never list a product without its link if the search tool returned one.
- After showing search results, don't assume the customer wants to buy. End with an open, low-pressure question that offers real choices — e.g. "Let me know if you'd like more details on any of these, or if you want to go ahead with a demo order." Serve what the customer actually wants next; don't push them toward checkout.
- Checkout flow — follow these steps IN ORDER, and only call placeOrder at the end, EXACTLY ONCE per purchase:
  1. Confirm the exact item and price with the customer.
  2. Collect their EMAIL ADDRESS — required, not optional, it's the one channel guaranteed to reach them. Also ask their FIRST NAME (optional, fun personal touch: their confirmation email arrives from their own name, e.g. thabo@blessinghlongwane.xyz).
  3. Ask ONCE (don't push): "Want order updates on WhatsApp too? Share your number if so." If they decline or skip, that's fine.
  4. Only after steps 1-3 are done, call placeOrder with everything collected.
- NEVER call placeOrder twice for the same purchase. If the customer shares extra details AFTER the order is placed (like a WhatsApp number they didn't give earlier), do NOT place a new order — acknowledge it and remind them their order is already confirmed via email.
- This is a demo checkout — orders are recorded but not real purchases. Say so plainly the first time you place one. Tell them a confirmation email is on its way — and to check their spam/junk folder if it isn't in their inbox, since first emails from a new domain often land there.
- If the tool result says the WhatsApp send failed, explain it lightly and honestly — something like: their number isn't on the guest list for Blessing's Twilio free-tier WhatsApp sandbox, so you sent a demo copy to Blessing's own number instead to prove it works, and they're welcome to message Blessing directly to get their number added. Make clear their order is still fully confirmed via email regardless.
- When a customer asks about an order, call getOrderStatus with the order ID they give you (format: ORD-XXXXXX).
- Always reply in the language the customer writes in. If they switch languages mid-conversation, switch with them.
- Keep replies short and conversational.
- If a tool call fails or returns nothing useful, say so honestly rather than guessing.`;

export function getTools(): ToolSet {
  return {
    searchProducts: tool({
      description:
        'Search for real, currently-listed products with real prices. Use this whenever the customer is browsing, comparing, or asking what is available.',
      inputSchema: z.object({
        query: z.string().describe('What to search for, e.g. "wireless earbuds under 1000"'),
        maxResults: z.number().int().min(1).max(10).optional(),
      }),
      execute: async ({ query, maxResults }) => {
        try {
          const results = await searchProducts(query, { limit: maxResults ?? 5 });
          console.log('searchProducts returned:', results.length, 'products');
          if (results.length === 0) return { found: false, message: 'No products found for that search.' };
          return {
            found: true,
            products: results.map((p) => ({
              title: p.title,
              price: p.price,
              currency: p.currency,
              url: p.url,
              source: p.source,
            })),
          };
        } catch (err) {
          console.error('searchProducts error:', err);
          return { found: false, message: `Search failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
        }
      },
    }),

    placeOrder: tool({
      description:
        'Record a demo order for a product the customer has decided to buy. Requires their email (always collect it first). Always confirm the item and price before calling this.',
      inputSchema: z.object({
        productTitle: z.string(),
        price: z.number().nullable(),
        currency: z.string().nullable(),
        quantity: z.number().int().min(1).default(1),
        customerName: z.string().optional().describe('Customer first name, if given — personalizes the confirmation email sender address.'),
        customerEmail: z.string().describe('Customer email address — required, always collect before calling this tool.'),
        productUrl: z.string().optional(),
        whatsappNumber: z
          .string()
          .optional()
          .describe('Customer WhatsApp number with country code, only if they opted in, e.g. +27821234567'),
      }),
      execute: async (input) => {
        const shortId = await createOrder(input);
        const orderDetails = {
          orderId: shortId,
          productTitle: input.productTitle,
          price: input.price,
          currency: input.currency,
          quantity: input.quantity,
        };

        let emailSent = false;
        try {
          await sendOrderConfirmationEmail(input.customerEmail, orderDetails, input.customerName);
          emailSent = true;
        } catch (err) {
          console.error('Order confirmation email failed', err);
        }

        // Silent — never surfaced to the model/customer.
        notifyAdminOfNewOrder({
          ...orderDetails,
          customerEmail: input.customerEmail,
          whatsappNumber: input.whatsappNumber,
        }).catch((err) => console.error('Admin notification email failed', err));

        let whatsappSent = false;
        let whatsappFallback = false;
        if (input.whatsappNumber) {
          const waMessage =
            `Order confirmed! ${input.productTitle} (${shortId}) — ${input.currency ?? ''} ${input.price ?? 'N/A'}. ` +
            `Status: processing, ETA 3-5 business days. This is a demo storefront, no real payment was taken.`;
          const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
          const normalize = (n: string) => n.replace(/^whatsapp:/, '').replace(/[^\d+]/g, '');
          // Twilio's sandbox ACCEPTS sends to non-joined numbers and only fails
          // delivery later, so a successful API call proves nothing. Only the
          // admin number is on the sandbox — anyone else goes straight to fallback.
          const onSandbox = adminNumber && normalize(input.whatsappNumber) === normalize(adminNumber);
          try {
            if (onSandbox) {
              await sendWhatsAppMessage(input.whatsappNumber, waMessage);
              whatsappSent = true;
            } else if (adminNumber) {
              await sendWhatsAppMessage(adminNumber, `[Demo fallback — customer number not on sandbox] ${waMessage}`);
              whatsappFallback = true;
            }
          } catch (err) {
            console.error('WhatsApp send failed', err);
          }
        }

        return {
          orderId: shortId,
          status: 'processing',
          eta: '3-5 business days',
          emailSent,
          whatsappSent,
          whatsappFallback,
          message: `Order ${shortId} recorded (demo checkout — no real payment was taken). Confirmation email ${
            emailSent ? 'sent' : 'failed to send'
          }.${
            input.whatsappNumber
              ? whatsappSent
                ? ' WhatsApp confirmation sent.'
                : whatsappFallback
                  ? ' WhatsApp to the customer number failed (not on the Twilio sandbox guest list) — sent a demo copy to Blessing\'s own number instead.'
                  : ' WhatsApp send failed.'
              : ''
          }`,
        };
      },
    }),

    getOrderStatus: tool({
      description: 'Look up the status of a previously placed demo order by its order ID (format ORD-XXXXXX).',
      inputSchema: z.object({
        orderId: z.string(),
      }),
      execute: async ({ orderId }) => {
        const order = await getOrderByShortId(orderId);
        if (!order) return { found: false, message: `No order found with ID ${orderId}.` };
        return {
          found: true,
          orderId: order.short_id,
          product: order.product_title,
          status: order.status,
          eta: order.eta,
          quantity: order.quantity,
        };
      },
    }),
  };
}
