'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

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
  'Wireless earbuds under R1000',
  'Status of order ORD-ABC123',
  'Running shoes for men',
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Ask for anything', desc: 'e.g. "wireless earbuds under R1000" or "track order ORD-XXXXXX".' },
  { step: '2', title: 'The agent searches live listings', desc: 'Real Google Shopping results, real prices, with links — not seeded demo data.' },
  { step: '3', title: 'Pick an item, share your email', desc: 'Required so you\'re always reachable. WhatsApp updates are optional.' },
  { step: '4', title: 'Order confirmed', desc: 'A real confirmation email is sent immediately (this is a demo checkout — no real payment).' },
  { step: '5', title: 'Check anytime', desc: 'Ask "where\'s my order?" with the order ID whenever you like.' },
];

const FEATURES = [
  {
    icon: '🔍',
    title: 'Real product search',
    desc: 'Live Google Shopping listings and live prices from real retailers — not seeded demo data.',
  },
  {
    icon: '🤖',
    title: 'Agentic tool-calling',
    desc: 'Built with the Vercel AI SDK. The agent decides when to search, place an order, or check a status.',
  },
  {
    icon: '📧',
    title: 'Real order emails',
    desc: 'Every order gets a real confirmation email, sent via Resend. This is the guaranteed-delivery channel.',
  },
  {
    icon: '💬',
    title: 'WhatsApp updates',
    desc: 'Optional, best-effort order updates sent via Twilio — opt in with your number at checkout.',
  },
  {
    icon: '🔎',
    title: 'Order status lookup',
    desc: 'Ask about any order ID anytime — no account or login needed.',
  },
];

const STACK = [
  { name: 'Next.js · TypeScript · React', desc: 'The app itself — App Router, server routes, client UI.' },
  { name: 'Vercel AI SDK', desc: "Orchestrates the agent's tool-calling loop." },
  { name: 'Google Gemini', desc: 'The model powering conversation and decisions.' },
  { name: 'RapidAPI · Real-Time Product Search', desc: 'Live Google Shopping product data.' },
  { name: 'Supabase (Postgres)', desc: 'Stores orders and conversation history.' },
  { name: 'Resend', desc: 'Sends order confirmation emails.' },
  { name: 'Twilio', desc: 'Sends optional WhatsApp order updates.' },
];

type TabKey = 'how' | 'features' | 'stack';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'how', label: 'How it works' },
  { key: 'features', label: 'Features' },
  { key: 'stack', label: 'Tech stack' },
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
  const [activeTab, setActiveTab] = useState<TabKey>('how');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="nav-mark">🛍️</span> shop.agent
          </div>
          <div className="nav-links">
            <a href="https://github.com/BlesstheGM" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <span className="nav-badge">🟢 Live demo</span>
          </div>
        </div>
      </nav>

      <main className="page">
        <section className="info">
          <h1>How shop.agent works</h1>

          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="tab-panel">
            {activeTab === 'how' && (
              <ol className="steps">
                {HOW_IT_WORKS.map((s) => (
                  <li key={s.step}>
                    <span className="step-num">{s.step}</span>
                    <div>
                      <div className="step-title">{s.title}</div>
                      <div className="step-desc">{s.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {activeTab === 'features' && (
              <div className="feature-grid">
                {FEATURES.map((f) => (
                  <div key={f.title} className="feature-card">
                    <div className="feature-icon">{f.icon}</div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stack' && (
              <div className="stack-list">
                {STACK.map((s) => (
                  <div key={s.name} className="stack-row">
                    <span className="stack-name">{s.name}</span>
                    <span className="stack-desc">{s.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

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
              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.role}`}>
                  {m.role === 'assistant' && <div className="msg-avatar">🛍️</div>}
                  <div className={`bubble ${m.role}`}>{renderRich(m.content)}</div>
                  {m.role === 'user' && <div className="msg-avatar user">🧑</div>}
                </div>
              ))}
              {loading && (
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

        <footer className="site-footer">
          <p>Built by Blessing Hlongwane</p>
          <p className="site-footer-stack">Next.js · Vercel AI SDK · Gemini · Supabase · Twilio</p>
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

        .info { padding: 2.5rem 0 2rem; }
        .info h1 {
          font-size: clamp(1.4rem, 3.5vw, 1.8rem);
          font-weight: 800;
          letter-spacing: -0.01em;
          margin-bottom: 1.25rem;
          text-align: center;
        }

        .tabs {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .tab-btn {
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--muted);
          font-family: var(--font);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tab-btn:hover { border-color: var(--accent); color: var(--accent); }
        .tab-btn.active {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          border-color: transparent;
          color: #fff;
        }

        .tab-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 1.5rem;
        }

        .steps { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
        .steps li { display: flex; gap: 0.9rem; align-items: flex-start; }
        .step-num {
          flex-shrink: 0;
          width: 26px; height: 26px;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 0.78rem;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .step-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.15rem; }
        .step-desc { font-size: 0.83rem; color: var(--muted); line-height: 1.5; }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .feature-card { padding: 0.25rem; }
        .feature-icon { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .feature-title { font-weight: 700; font-size: 0.88rem; margin-bottom: 0.3rem; }
        .feature-desc { font-size: 0.8rem; color: var(--muted); line-height: 1.5; }

        .stack-list { display: flex; flex-direction: column; gap: 0.7rem; }
        .stack-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 1rem;
          padding: 0.55rem 0;
          border-bottom: 1px solid var(--border);
        }
        .stack-row:last-child { border-bottom: none; padding-bottom: 0; }
        .stack-name { font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
        .stack-desc { font-size: 0.8rem; color: var(--muted); text-align: right; }

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
          .stack-row { flex-direction: column; gap: 0.15rem; }
          .stack-desc { text-align: left; }
          .chat-messages { min-height: 320px; }
          .bubble { max-width: 85%; }
        }
      `}</style>
    </>
  );
}
