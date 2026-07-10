import { tool, type ToolSet } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { searchProducts } from './catalog';
import { createOrder, getOrderByShortId } from './db';
import { sendWhatsAppMessage } from './whatsapp';

/**
 * Single agent core shared by both surfaces (web chat + WhatsApp webhook).
 * Only the transport differs between /api/chat and /api/whatsapp — the model,
 * tools, and system prompt live here so both channels behave identically.
 */

// Model id is env-overridable: if Google renames/retires the default, set
// GEMINI_MODEL in the environment instead of editing code.
export const model = google(process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite');

export const SYSTEM_PROMPT = `You are a shopping concierge for a demo storefront built by Blessing Hlongwane.
You help customers find real products, place a demo order, and check on an existing order.

Rules:
- Product results come from a live product search (real listings, real prices, sourced from Google Shopping via RapidAPI). Always call the search tool rather than inventing products or prices.
- Prices may be in various currencies depending on the listing; state the currency you see, don't assume ZAR unless that's what the listing shows.
- Every product you list MUST include its link as a markdown link, formatted exactly like this: **Product Name** — R249 [View](https://...). Never list a product without its link if the search tool returned one.
- When a customer wants to buy something, confirm the exact item and price with them. Then, before calling placeOrder, ask once: "Want order updates sent to your WhatsApp? If so, share your number (with country code)." This is optional — if they decline or don't give a number, place the order anyway without one.
- Call placeOrder once you have their confirmation (and their WhatsApp number, if they gave one). This is a demo checkout — orders are recorded but not real purchases. Say so plainly the first time you place one.
- When a customer asks about an order, call getOrderStatus with the order ID they give you (format: ORD-XXXXXX).
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
        const results = await searchProducts(query, { limit: maxResults ?? 5 });
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
      },
    }),

    placeOrder: tool({
      description:
        'Record a demo order for a product the customer has decided to buy. Always confirm the item, price, and (once) offer WhatsApp updates before calling this.',
      inputSchema: z.object({
        productTitle: z.string(),
        price: z.number().nullable(),
        currency: z.string().nullable(),
        quantity: z.number().int().min(1).default(1),
        customerName: z.string().optional(),
        productUrl: z.string().optional(),
        whatsappNumber: z
          .string()
          .optional()
          .describe('Customer WhatsApp number with country code, only if they opted in, e.g. +27821234567'),
      }),
      execute: async (input) => {
        const shortId = await createOrder(input);

        let whatsappSent = false;
        if (input.whatsappNumber) {
          try {
            await sendWhatsAppMessage(
              input.whatsappNumber,
              `Order confirmed! ${input.productTitle} (${shortId}) — ${input.currency ?? ''} ${input.price ?? 'N/A'}. ` +
                `Status: processing, ETA 3-5 business days. This is a demo storefront, no real payment was taken.`,
            );
            whatsappSent = true;
          } catch (err) {
            console.error('WhatsApp send failed', err);
          }
        }

        return {
          orderId: shortId,
          status: 'processing',
          eta: '3-5 business days',
          whatsappSent,
          message: `Order ${shortId} recorded (demo checkout — no real payment was taken).${
            input.whatsappNumber ? (whatsappSent ? ' WhatsApp confirmation sent.' : ' WhatsApp send failed.') : ''
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
