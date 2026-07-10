'use client';

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

const SESSION_KEY = 'shop_session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const STARTERS = [
  'Show me wireless earbuds under R1000',
  "What's the status of order ORD-ABC123?",
  'Find running shoes for men',
];

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        "Hey — I'm a shopping concierge agent. I search real, live products (real prices, not fake data) and can place a demo order or check one for you. What are you looking for?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || !sessionId) return;

    setMessages((m) => [...m, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shop">
      <div className="shop-header">
        <div>
          <div className="shop-title">Blessing Hlongwane / shop.agent</div>
          <div className="shop-sub">AI shopping concierge — real products, live tool-calling, WhatsApp-ready</div>
        </div>
      </div>

      <div className="shop-window">
        <div className="shop-messages">
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role}`}>
              <span className="bubble-role">{m.role === 'user' ? 'you' : 'agent'}</span>
              <span className="bubble-text">{m.content}</span>
            </div>
          ))}
          {loading && (
            <div className="bubble assistant">
              <span className="bubble-role">agent</span>
              <span className="bubble-text typing">thinking…</span>
            </div>
          )}
          {error && <div className="shop-error">⚠ {error}</div>}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div className="shop-starters">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="shop-form"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a product, or an order ID…"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            send
          </button>
        </form>
      </div>

      <footer className="shop-footer">
        <p>
          blessing@portfolio:~$ <span style={{ color: 'var(--green, var(--accent))' }}>exit 0</span>
        </p>
        <p style={{ marginTop: '0.4rem' }}>Built with Next.js · Vercel AI SDK · Gemini · Supabase · Twilio</p>
      </footer>

      <style>{`
        .shop {
          min-height: 100vh;
          padding: 2rem 1.25rem;
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
        .shop-header {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .shop-title { color: var(--blue); font-weight: bold; font-size: 1.1rem; }
        .shop-sub { color: var(--dim); font-size: 0.8rem; margin-top: 0.15rem; }

        .shop-window {
          border: 1px solid var(--border);
          background: var(--card-bg);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          height: 65vh;
          min-height: 420px;
          overflow: hidden;
        }
        .shop-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .bubble {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          max-width: 85%;
          padding: 0.55rem 0.75rem;
          border-radius: 6px;
          font-size: 0.88rem;
          line-height: 1.5;
        }
        .bubble.user {
          align-self: flex-end;
          background: rgba(79, 195, 247, 0.1);
          border: 1px solid var(--border);
        }
        .bubble.assistant {
          align-self: flex-start;
          background: rgba(128, 222, 234, 0.06);
          border: 1px solid var(--border);
        }
        .bubble-role {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--dim);
        }
        .bubble-text { color: var(--fg); white-space: pre-wrap; }
        .typing { color: var(--dim); font-style: italic; }
        .shop-error { color: var(--warn); font-size: 0.8rem; }

        .shop-starters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0 1rem 0.75rem;
        }
        .shop-starters button {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--accent);
          font-family: var(--font);
          font-size: 0.75rem;
          padding: 0.35rem 0.6rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .shop-starters button:hover { border-color: var(--blue); color: var(--blue); }

        .shop-form {
          display: flex;
          gap: 0.5rem;
          border-top: 1px solid var(--border);
          padding: 0.75rem;
        }
        .shop-form input {
          flex: 1;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--fg);
          font-family: var(--font);
          font-size: 0.88rem;
          padding: 0.55rem 0.7rem;
        }
        .shop-form input:focus { outline: none; border-color: var(--blue); }
        .shop-form button {
          background: var(--blue);
          color: var(--bg);
          border: none;
          border-radius: 4px;
          padding: 0 1rem;
          font-family: var(--font);
          font-weight: bold;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .shop-form button:disabled { opacity: 0.5; cursor: default; }

        .shop-footer {
          text-align: center;
          color: var(--dim);
          font-size: 0.75rem;
          margin-top: 1.5rem;
          padding-bottom: 1rem;
        }
      `}</style>
    </main>
  );
}
