<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# shop.agent — project guide

An AI shopping agent deployed at [blessinghlongwane.xyz](https://blessinghlongwane.xyz). Web chat + WhatsApp share one agent core.

## Map

- `lib/agent.ts` — the agent: model, system prompt, tools (`searchProducts`, `placeOrder`, `getOrderStatus`). Both channels use this; change behavior here, not in routes.
- `app/api/chat/route.ts` — web chat endpoint (JSON in/out, session-scoped history).
- `app/api/whatsapp/route.ts` — Twilio inbound webhook (signature-validated, TwiML out).
- `lib/catalog.ts` — RapidAPI Real-Time Product Search (live Google Shopping data).
- `lib/db.ts` — Supabase reads/writes: conversation history + orders.
- `lib/email.ts` — Resend: customer confirmations (personalized sender) + silent admin notifications.
- `lib/whatsapp.ts` — Twilio WhatsApp send.
- `app/page.tsx` — the entire UI (single client component, inline styles).
- `supabase.sql` — schema; run once in the Supabase SQL Editor.

## Rules learned in production (do not regress)

- History queries must fetch **newest-first then reverse** — ascending+limit silently breaks sessions past the window size.
- Never persist or replay **empty assistant messages** — they poison Gemini into empty responses.
- Resend's SDK returns `{ error }` instead of throwing — **always check it**.
- Twilio sandbox **accepts** sends to non-joined numbers and fails delivery later — only the admin number is deliverable; everyone else gets the honest fallback.
- `placeOrder` is called **exactly once** per checkout, after email (+ optional name/WhatsApp) is collected.
- The admin order-notification email is **silent** — never mention it in agent-facing tool results.

## Workflow

- Secrets live in `.env.local` (never committed) and Vercel env vars. Template: `.env.example`.
- Verify with `npm run build` once, commit, push to `main` — Vercel auto-deploys. No dev-server smoke tests unless asked.
