'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

const STARTERS = [
  'Wireless earbuds under R1000',
  'Coffee machines under R2000',
  'Running shoes for men',
];

const FEATURES = [
  {
    icon: '🛍️',
    title: 'Full-stack e-commerce agent',
    desc: 'React/TypeScript frontend, serverless backend, Postgres data layer. Take a feature from idea to live across the whole stack.',
  },
  {
    icon: '🤖',
    title: 'Agentic tool-calling with Vercel AI SDK',
    desc: 'Built with Vercel AI SDK and Google Gemini. The agent decides when to search products, place orders, or look up status.',
  },
  {
    icon: '🔌',
    title: 'Real-time API integrations',
    desc: 'Live product search (RapidAPI), transactional email (Resend), WhatsApp updates (Twilio). Handle cross-system failures gracefully.',
  },
  {
    icon: '📊',
    title: 'Scalable data',
    desc: 'Supabase + Postgres for multi-tenant safety. Order workflow with email confirmations, status tracking, and secure customer data.',
  },
  {
    icon: '☁️',
    title: 'Vercel cloud deployment',
    desc: 'Next.js App Router on Vercel, environment-based config, real secrets in .env, auto-deploy on push. You own it after ship.',
  },
  {
    icon: '✉️',
    title: 'Personalized email sender',
    desc: 'Tell the agent your name and your order confirmation arrives from you@blessinghlongwane.xyz — dynamic sender addresses via Resend on a verified domain.',
  },
];

/** Turns **bold** + "* bullet" markdown-lite into JSX without a markdown dependency. */
function renderRich(text: string): ReactNode {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const blocks: ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (key: string) => {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={key} className="msg-list">
        {bulletBuffer.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  };

  lines.forEach((line, i) => {
    const bulletMatch = line.match(/^\s*[*\-]\s+(.*)$/);
    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
    } else {
      flushBullets(`ul-${i}`);
      blocks.push(<p key={`p-${i}`}>{renderInline(line)}</p>);
    }
  });
  flushBullets('ul-end');

  return <>{blocks}</>;
}

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/;
const BOLD_RE = /\*\*([^*]+)\*\*/;
const INLINE_RE = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*)/g;

/**
 * While a reply is streaming, the tail of the text is often a half-written
 * markdown token (`**Redmi Bu` or `[View](https://takealo`). Rendering that
 * raw looks broken and then "snaps" into formatting — so trim the incomplete
 * token from the visible text until it finishes arriving.
 */
function trimIncompleteMarkdown(text: string): string {
  let out = text;

  // Unfinished link: a trailing "[...", "[...]" or "[...](..." with no closing ")".
  const linkStart = out.lastIndexOf('[');
  if (linkStart !== -1) {
    const tail = out.slice(linkStart);
    if (/^\[[^\]]*$/.test(tail) || /^\[[^\]]*\]$/.test(tail) || /^\[[^\]]*\]\([^)]*$/.test(tail)) {
      out = out.slice(0, linkStart);
    }
  }

  // Unfinished bold: an odd number of "**" markers means the last one is open.
  const boldMarkers = out.match(/\*\*/g);
  if (boldMarkers && boldMarkers.length % 2 === 1) {
    out = out.slice(0, out.lastIndexOf('**'));
  }

  return out;
}

function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE_RE).filter(Boolean);
  return parts.map((part, i) => {
    const link = part.match(LINK_RE);
    if (link) {
      return (
        <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="msg-link">
          {link[1]} ↗
        </a>
      );
    }
    const bold = part.match(BOLD_RE);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        "Hey — I'm a shopping agent. I search live Google Shopping listings (real retailers, real prices) and can place a demo order or check one for you. What are you looking for?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fresh session every page load: what you see is all the agent remembers.
    // A persisted id would let the agent recall a previous visitor's details
    // (email, orders) in a chat that looks brand new.
    setSessionId(crypto.randomUUID());
  }, []);

  useEffect(() => {
    // Instant scroll while streaming — smooth scrolling can't keep up with
    // per-token updates and ends up lagging behind the text.
    bottomRef.current?.scrollIntoView({ behavior: loading ? 'auto' : 'smooth', block: 'nearest' });
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
      if (!res.ok || !res.body) {
        // Error responses are JSON from our route, plain text from the platform
        // (e.g. a Vercel timeout) — handle both without a raw parse error.
        const raw = await res.text().catch(() => '');
        let msg = 'That took too long or something broke — please try again.';
        try {
          const parsed = JSON.parse(raw) as { error?: string };
          if (parsed?.error) msg = parsed.error;
        } catch {}
        throw new Error(msg);
      }

      // The reply streams as plain text — append a bubble on the first chunk
      // and grow it as tokens arrive.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';
      let started = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        if (!acc.trim()) continue;
        if (!started) {
          started = true;
          setMessages((m) => [...m, { role: 'assistant', content: acc }]);
        } else {
          setMessages((m) => {
            const copy = m.slice();
            copy[copy.length - 1] = { role: 'assistant', content: acc };
            return copy;
          });
        }
      }
      acc += decoder.decode();
      if (!acc.trim()) {
        setMessages((m) => [...m, { role: 'assistant', content: 'Sorry — I glitched on that one. Could you send that again?' }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-mark">🛍️</span> shop.agent
          </div>
          <div className="nav-links">
            <a href="https://github.com/BlesstheGM/portfolio" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <span className="nav-badge">🟢 Live demo</span>
          </div>
        </div>
      </nav>

      <main className="page">
        <section className="chat-wrap">
          <div className="chat-card">
            <div className="chat-head">
              <div className="chat-avatar">🛍️</div>
              <div className="chat-head-text">
                <div className="chat-head-title">
                  Shop Agent <span className="dot-online" />
                </div>
                <div className="chat-head-sub">Powered by Gemini · tool-calling agent</div>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => {
                const isStreaming = loading && i === messages.length - 1 && m.role === 'assistant';
                return (
                  <div key={i} className={`msg-row ${m.role}`}>
                    {m.role === 'assistant' && <div className="msg-avatar">🛍️</div>}
                    <div className={`bubble ${m.role}${isStreaming ? ' streaming' : ''}`}>
                      {renderRich(isStreaming ? trimIncompleteMarkdown(m.content) : m.content)}
                    </div>
                    {m.role === 'user' && <div className="msg-avatar user">🧑</div>}
                  </div>
                );
              })}
              {loading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="msg-row assistant">
                  <div className="msg-avatar">🛍️</div>
                  <div className="bubble assistant typing-bubble">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}
              {error && <div className="chat-error">⚠ {error}</div>}
              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && (
              <div className="starters">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => send(s)} disabled={loading}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              className="chat-form"
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
              <button type="submit" className="send-btn" disabled={loading || !input.trim()} aria-label="Send">
                ➤
              </button>
            </form>
          </div>
        </section>

        <section className="features-section">
          <h2>What I built into this</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          <p>Built by Blessing Hlongwane</p>
          <p className="site-footer-stack">Next.js · Vercel AI SDK · Claude · Gemini · Supabase · Resend · Twilio</p>
        </footer>
      </main>

      <style>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(245, 246, 251, 0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
        }
        .nav-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 0.9rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand { font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem; }
        .nav-mark { font-size: 1.1rem; }
        .nav-links { display: flex; align-items: center; gap: 1rem; font-size: 0.85rem; color: var(--muted); }
        .nav-links a:hover { color: var(--accent); }
        .nav-badge {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .page { max-width: 900px; margin: 0 auto; padding: 0 1.5rem; }

        .features-section { padding: 3rem 0; }
        .features-section h2 {
          font-size: clamp(1.2rem, 3vw, 1.5rem);
          font-weight: 800;
          letter-spacing: -0.01em;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.2rem;
        }
        .feature-card {
          padding: 1.1rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .feature-card:hover { border-color: var(--accent); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.12); }
        .feature-icon { font-size: 1.5rem; margin-bottom: 0.65rem; }
        .feature-title { font-weight: 700; font-size: 0.92rem; margin-bottom: 0.4rem; }
        .feature-desc { font-size: 0.8rem; color: var(--muted); line-height: 1.6; }

        .chat-wrap { display: flex; justify-content: center; padding: 2.5rem 0 3rem; }
        .chat-card {
          width: 100%;
          max-width: 640px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 22px;
          box-shadow: 0 24px 60px -28px rgba(79, 70, 229, 0.3), 0 8px 24px rgba(15, 23, 42, 0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-head {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border);
        }
        .chat-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.05rem;
          flex-shrink: 0;
        }
        .chat-head-title { font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.4rem; }
        .chat-head-sub { font-size: 0.76rem; color: var(--muted); margin-top: 0.1rem; }
        .dot-online {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          min-height: 380px;
          max-height: 55vh;
          background: #fbfbfe;
        }

        .msg-row { display: flex; align-items: flex-end; gap: 0.5rem; }
        .msg-row.user { justify-content: flex-end; }
        .msg-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--accent-soft);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; flex-shrink: 0;
        }
        .msg-avatar.user { background: #e9ebf5; }

        .bubble {
          max-width: 75%;
          padding: 0.6rem 0.9rem;
          border-radius: 16px;
          font-size: 0.9rem;
          line-height: 1.55;
          animation: pop 0.18s ease-out;
        }
        @keyframes pop {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bubble.assistant {
          background: var(--surface);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
          color: var(--ink);
        }
        .msg-link {
          color: var(--accent);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .bubble.user .msg-link { color: #fff; text-decoration-color: rgba(255,255,255,0.6); }
        .bubble.user {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .bubble p { margin: 0.15rem 0; }
        .bubble p:first-child { margin-top: 0; }
        .bubble p:last-child { margin-bottom: 0; }
        .msg-list { margin: 0.3rem 0; padding-left: 1.1rem; }
        .msg-list li { margin-bottom: 0.2rem; }

        .bubble.streaming > p:last-child::after,
        .bubble.streaming > ul:last-child > li:last-child::after {
          content: '';
          display: inline-block;
          width: 3px;
          height: 1em;
          margin-left: 3px;
          border-radius: 2px;
          background: var(--accent);
          vertical-align: text-bottom;
          animation: blink 0.9s steps(2) infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        .typing-bubble { display: flex; gap: 0.3rem; align-items: center; padding: 0.75rem 1rem; }
        .typing-bubble .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--muted);
          animation: bounce 1.1s infinite ease-in-out;
        }
        .typing-bubble .dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-bubble .dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        .chat-error { color: #dc2626; font-size: 0.8rem; padding: 0.2rem 0.3rem; }

        .starters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 0 1.1rem 0.9rem;
        }
        .starters button {
          background: var(--accent-soft);
          border: none;
          color: var(--accent);
          font-family: var(--font);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          cursor: pointer;
          transition: transform 0.12s, background 0.12s;
        }
        .starters button:hover { background: #e2e6ff; transform: translateY(-1px); }
        .starters button:disabled { opacity: 0.5; cursor: default; transform: none; }

        .chat-form {
          display: flex;
          gap: 0.6rem;
          border-top: 1px solid var(--border);
          padding: 0.85rem 1rem;
          background: var(--surface);
        }
        .chat-form input {
          flex: 1;
          background: #f3f4f8;
          border: 1px solid transparent;
          border-radius: 999px;
          color: var(--ink);
          font-family: var(--font);
          font-size: 0.9rem;
          padding: 0.65rem 1.1rem;
          transition: border-color 0.15s, background 0.15s;
        }
        .chat-form input:focus {
          outline: none;
          background: var(--surface);
          border-color: var(--accent);
        }
        .send-btn {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.12s, opacity 0.12s;
        }
        .send-btn:hover:not(:disabled) { transform: scale(1.06); }
        .send-btn:disabled { opacity: 0.4; cursor: default; }

        .site-footer {
          text-align: center;
          color: var(--muted);
          font-size: 0.8rem;
          padding: 1.5rem 0 2.5rem;
          border-top: 1px solid var(--border);
        }
        .site-footer-stack { margin-top: 0.3rem; font-size: 0.75rem; opacity: 0.8; }

        @media (max-width: 640px) {
          .feature-grid { grid-template-columns: 1fr; }
          .chat-messages { min-height: 320px; }
          .bubble { max-width: 85%; }
        }
      `}</style>
    </>
  );
}
