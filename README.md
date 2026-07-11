# 🛍️ shop.agent

**An AI shopping agent that holds a real sales conversation end to end** — live product search, checkout, confirmation emails, WhatsApp updates — built and deployed as a working demo **in 5 hours**.

**Live:** [blessinghlongwane.xyz](https://blessinghlongwane.xyz)

> Ask it for "wireless earbuds under R1000" and it searches live Google Shopping listings with real prices from real retailers, walks you through a demo checkout, emails you a confirmation, and can text you order updates on WhatsApp.

---

## What it does

| | |
|---|---|
| 🔍 **Real product search** | Live Google Shopping listings via RapidAPI — real retailers, real prices, clickable links. No seeded data. |
| 🤖 **Agentic tool-calling** | The model decides for itself when to search, place an order, or look up status — orchestrated by the Vercel AI SDK. |
| 📧 **Transactional email** | Order confirmations via Resend on a verified custom domain. |
| ✉️ **Personalized sender** | Tell the agent your name and your confirmation arrives from `yourname@blessinghlongwane.xyz`. |
| 💬 **WhatsApp updates** | Optional order updates via Twilio — with an honest fallback path when a number isn't reachable. |
| 🔎 **Order tracking** | Ask about any order ID (`ORD-XXXXXX`) anytime. No login needed. |

## Architecture

```
┌────────────────┐     ┌──────────────────────────────────────┐
│  Web chat (/)  │────▶│  /api/chat        Next.js API route  │
└────────────────┘     │                                      │
┌────────────────┐     │   ┌──────────────────────────────┐   │
│ WhatsApp inbound│───▶│   │  Agent core (lib/agent.ts)   │   │
│ Twilio webhook  │     │   │  Vercel AI SDK · Gemini      │   │
└────────────────┘     │   │  tools: searchProducts,      │   │
                       │   │  placeOrder, getOrderStatus  │   │
                       │   └──────┬───────────────────────┘   │
                       └──────────┼───────────────────────────┘
                                  │
              ┌───────────────────┼──────────────────────┐
              ▼                   ▼                      ▼
     ┌────────────────┐  ┌────────────────┐   ┌──────────────────┐
     │ RapidAPI        │  │ Supabase        │   │ Resend (email)   │
     │ Google Shopping │  │ (Postgres)      │   │ Twilio (WhatsApp)│
     │ live listings   │  │ orders + memory │   │ notifications    │
     └────────────────┘  └────────────────┘   └──────────────────┘
```

One agent core, two transports: the web chat and the WhatsApp webhook share the same model, system prompt, and tools — only the delivery channel differs.

## Stack

- **Next.js 16 · React 19 · TypeScript** — App Router, serverless API routes, client chat UI
- **Vercel AI SDK** — multi-step tool-calling loop (`generateText` + `stopWhen`)
- **Google Gemini** — the model behind the conversation (provider-agnostic via the AI SDK)
- **Supabase (Postgres)** — orders and conversation memory; RLS enabled, server-only service-role access
- **RapidAPI Real-Time Product Search** — live Google Shopping data
- **Resend** — transactional email on a verified domain (SPF/DKIM/DMARC configured)
- **Twilio** — WhatsApp messaging with signature-validated webhooks
- **Vercel** — hosting, auto-deploy on push to `main`

## How a checkout works

1. Customer asks for a product → agent calls `searchProducts` → live listings with prices and links
2. Customer picks an item → agent confirms item + price
3. Agent collects an **email address** (required — the guaranteed channel) and optionally a **first name** (personalizes the sender address)
4. Agent offers **WhatsApp updates** once, no pressure
5. `placeOrder` runs exactly once: order recorded in Postgres, confirmation email sent, WhatsApp update sent (or honest fallback if the number isn't on the Twilio sandbox)
6. Customer can ask about their order ID anytime → `getOrderStatus`

No real payments — it's a demo storefront and the agent says so plainly.

## Production lessons baked in

Real bugs found and fixed while running this in production:

- **Conversation memory pagination** — fetching history oldest-first with a limit silently broke every session past 20 messages (the model stopped seeing new messages). Fixed: newest-first window, re-reversed to chronological.
- **Empty-turn poisoning** — a single empty assistant reply saved to history made Gemini return empty forever after. Fixed: empty messages are never persisted and filtered from history.
- **Silent email failures** — Resend's SDK returns `{ error }` instead of throwing, so failed sends looked like successes. Fixed: errors are checked and surfaced.
- **Accept-then-fail WhatsApp delivery** — Twilio's sandbox accepts API calls for non-joined numbers and only fails delivery later. Fixed: deterministic fallback, and the agent never claims delivery it can't verify.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Required environment variables (see `.env.local`):

```
GOOGLE_GENERATIVE_AI_API_KEY   # Gemini
GEMINI_MODEL                   # e.g. gemini-3.1-flash-lite
RAPIDAPI_KEY / RAPIDAPI_HOST   # Real-Time Product Search
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER         # Twilio sandbox number
ADMIN_WHATSAPP_NUMBER          # fallback recipient
RESEND_API_KEY
RESEND_FROM                    # e.g. Shop Agent <orders@yourdomain>
ADMIN_EMAIL                    # order notifications
```

Database schema: run [`supabase.sql`](supabase.sql) once in the Supabase SQL Editor.

---

Built by **Blessing Hlongwane** · [blessinghlongwane.xyz](https://blessinghlongwane.xyz)
