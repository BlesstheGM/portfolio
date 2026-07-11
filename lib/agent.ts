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

export const SYSTEM_PROMPT = `You are a shopping agent. Help customers find products, place demo orders, and check order status. Be conversational and helpful.`;

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
        customerName: z.string().optional(),
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
          await sendOrderConfirmationEmail(input.customerEmail, orderDetails);
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
          try {
            await sendWhatsAppMessage(input.whatsappNumber, waMessage);
            whatsappSent = true;
          } catch (err) {
            console.error('WhatsApp send failed, falling back to admin number', err);
            const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER;
            if (adminNumber) {
              try {
                await sendWhatsAppMessage(adminNumber, `[Demo fallback — customer number unreachable] ${waMessage}`);
                whatsappFallback = true;
              } catch (fallbackErr) {
                console.error('WhatsApp fallback send also failed', fallbackErr);
              }
            }
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
