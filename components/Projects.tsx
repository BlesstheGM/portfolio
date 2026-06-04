interface Project {
  name: string;
  filename: string;
  desc: string;
  highlights: string[];
  stack: string[];
  testing: string;
  vcs: string;
  deployment?: string;
  status: 'active' | 'shipped';
  github: string;
  demo?: string;
}

const projects: Project[] = [
  {
    name: 'Retail Price Aggregator API',
    filename: 'rprc/',
    desc: 'An on-chain retail price oracle being built for the SA market. Scrapes real-time food and grocery prices from 10 major SA retailers (~120,000 SKUs), stores full price history in Postgres, and publishes verified price feeds on Base chain — consumable by DeFi protocols, AI agents, and price comparison apps.',
    highlights: [
      'Discovery-first scrapers: dynamically walks full category trees for all 10 retailers — Checkers, Shoprite, PnP, Woolworths, Spar, Makro, Mr D, Uber Eats SA, Glovo, OneCart',
      'Location-driven scraping using OpenStreetMap store coordinates — passes real branch lat/lng to bypass mandatory address/store selection modals',
      'On-chain oracle (SARetailOracle.sol) on Base L2, AggregatorV3 compatible — push + pull model, GitHub Actions CI for automated 3h/daily scrape cycles',
    ],
    stack: ['Python', 'Playwright', 'httpx', 'BeautifulSoup', 'Next.js', 'TypeScript', 'Supabase', 'Solidity', 'Foundry', 'Base chain', 'viem', 'Upstash Redis', 'GitHub Actions'],
    testing: 'Per-store scraper validation · Category tree walk tests · On-chain oracle deviation checks',
    vcs: 'Git / GitHub',
    status: 'active',
    github: 'https://github.com/BlesstheGM',
  },
  {
    name: 'Offline P2P Messenger',
    filename: 'BluetoothMesh.kt',
    desc: 'Android peer-to-peer messenger that routes messages over Bluetooth mesh connections — fully offline, no internet required. Final year group project at UCT, scored 80%+.',
    highlights: [
      'Bluetooth nodes relay messages through the mesh — works in areas with zero connectivity',
      'Android app with chat UI; messages routed through intermediate devices acting as nodes',
      'Collaborative group project with version-controlled development workflow',
    ],
    stack: ['Kotlin', 'Java', 'Android SDK', 'Bluetooth API', 'P2P Networking'],
    testing: 'Device-to-device manual testing · Multi-hop relay tests across 3+ devices',
    vcs: 'Git / GitHub',
    status: 'shipped',
    github: 'https://github.com/BlesstheGM',
  },
  {
    name: 'CalendarSite',
    filename: 'calendar_site/',
    desc: 'Full-stack event calendar application with RSVP functionality, automated guest email invitations, AI-powered facts and quotes per RSVP, and confirmation email delivery.',
    highlights: [
      'Event creation with full details, automated guest email invitations via Gmail SMTP with unique RSVP links per guest',
      'OpenAI integration serving personalized AI-generated facts and quotes on each RSVP confirmation page',
      'SQLAlchemy ORM on SQLite with Pydantic data validation; deployed on Render',
    ],
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'SQLite', 'Pydantic', 'OpenAI API', 'Gmail SMTP', 'JavaScript', 'HTML5', 'CSS3'],
    testing: 'Manual end-to-end RSVP flows · Email delivery verification · Edge case empty guest lists',
    vcs: 'Git / GitHub',
    deployment: 'Render',
    status: 'shipped',
    github: 'https://github.com/BlesstheGM/CalendarSite',
  },
  {
    name: 'Market Data & Research Pipeline',
    filename: 'research_pipeline.py',
    desc: 'Data collection and analysis pipeline for live Polymarket and Coinbase order-book data. Used to validate strategies before deploying to the live trading bot — simulation-first approach.',
    highlights: [
      'Tick data collection from Polymarket & Coinbase CLOB order books via WebSocket',
      'Probes for lead-lag behaviour, fill quality, signal accuracy, flip detection, and latency-sensitive execution decisions',
      'Results drove trading rules, order types, sizing logic, and risk controls in the trading bot',
    ],
    stack: ['Python', 'Streamlit', 'pandas', 'NumPy', 'WebSockets', 'REST APIs', 'SQLite'],
    testing: 'Simulation runs on historical tick data · Metrics logging · Visualised in Streamlit',
    vcs: 'Git / GitHub',
    status: 'active',
    github: 'https://github.com/BlesstheGM',
  },
  {
    name: 'Crypto Trading Bot',
    filename: 'polymarket_bot.py',
    desc: 'Live crypto trading bot for Polymarket 5-minute UP/DOWN binary markets. Integrates Coinbase WebSocket spot data, Deribit implied volatility, Polymarket CLOB order books, and Chainlink/Polygon resolution data into a single low-latency execution engine.',
    highlights: [
      'Strategies: probability signals, order-flow imbalance, microprice, dynamic position sizing, arbitrage, market-making',
      'Execution layer: CLOB order signing, FOK/FAK/GTC order handling, pre-signed orders, latency-aware buy-path optimisation',
      'Risk tooling: exposure limits, budget caps, automated merge/redeem workflows onchain, balance recovery, post-resolution settlement',
    ],
    stack: ['Python', 'asyncio', 'uvloop', 'WebSockets', 'Polymarket CLOB', 'Chainlink', 'Deribit API', 'orjson', 'REST APIs'],
    testing: 'Paper/live mode toggle · Trade logging · Retry guards · Exposure limit checks',
    vcs: 'Git / GitHub',
    status: 'active',
    github: 'https://github.com/BlesstheGM',
  },
  {
    name: 'Multithreaded Concurrent Swimming Race',
    filename: 'MedleySimulation.java',
    desc: 'A concurrent Java simulation of a medley swimming relay race. Multiple threads represent swimmers racing in parallel through a shared grid — a coursework project exploring concurrency primitives, thread synchronisation, and shared-state management.',
    highlights: [
      'Threads represent individual swimmers; shared stadium grid managed with synchronized access',
      'FinishCounter uses concurrent primitives to track and display race results in real time',
      'StadiumView renders a live ASCII/graphical view of the race as threads update position',
    ],
    stack: ['Java', 'Multithreading', 'Synchronization', 'Concurrent Programming', 'Makefile'],
    testing: 'Manual race observation · Multiple concurrent swimmer configurations · Race condition stress tests',
    vcs: 'Git / GitHub',
    status: 'shipped',
    github: 'https://github.com/BlesstheGM',
  },
  {
    name: 'Sandpile Image Generator',
    filename: 'SandpileGenerator.java',
    desc: 'Optimized a sequential Abelian sandpile model image generator by introducing parallelization using Java\'s Fork/Join Framework. Achieved a 3× average runtime improvement on large datasets.',
    highlights: [
      'Fork/Join recursive decomposition of the sandpile stabilisation computation',
      '3× average speedup on large datasets via work-stealing thread pool',
      'Visual output comparing sequential vs parallel execution across dataset sizes',
    ],
    stack: ['Java', 'Fork/Join Framework', 'Parallel Computing', 'Performance Benchmarking'],
    testing: 'Benchmarked sequential vs parallel across varying N values · Correctness comparison of output images',
    vcs: 'Git / GitHub',
    status: 'shipped',
    github: 'https://github.com/BlesstheGM/Sandpile-Image-Generator',
  },
  {
    name: 'Email Summarizer',
    filename: 'email_summarizer.json',
    desc: 'AI-powered email automation tool using n8n workflow engine and OpenAI GPT. Automatically fetches, processes, and summarizes daily emails into digestible highlights.',
    highlights: [
      'n8n workflow triggered on schedule to fetch inbox via Gmail API',
      'OpenAI GPT condenses long email threads to key action points',
      'Delivered summaries to configured notification channel automatically',
    ],
    stack: ['n8n', 'OpenAI API', 'Gmail API', 'JavaScript', 'Workflow Automation'],
    testing: 'Tested on varied daily email volumes · Edge cases for empty inboxes and large attachments',
    vcs: 'Git',
    status: 'active',
    github: 'https://github.com/BlesstheGM',
  },
  {
    name: 'Image Viewer',
    filename: 'main.py',
    desc: 'A Python desktop image viewer with a custom GUI — supports directory browsing, image editing, a favourites system, and keyboard navigation.',
    highlights: [
      'Directory picker for browsing local image folders with thumbnail preview',
      'Image editing utilities: crop, resize, rotate, and filter operations',
      'Persistent favourites list stored locally for quick access to saved images',
    ],
    stack: ['Python', 'Tkinter', 'Pillow', 'Custom GUI'],
    testing: 'Manual testing across image formats (JPEG, PNG) · Edge cases for empty directories',
    vcs: 'Git / GitHub',
    status: 'shipped',
    github: 'https://github.com/BlesstheGM/Image-Viewer',
  },
  {
    name: 'Super Mario Game',
    filename: 'SuperDupaGame.py',
    desc: 'A Python platformer game inspired by Super Mario — built to explore game physics, sprite animation, and tile-based level design.',
    highlights: [
      'Platform physics: gravity, collision detection, variable-height jumping',
      'Sprite animation state machine (idle, run, jump) and tile-based level rendering',
      'Featured on LinkedIn — received strong community engagement',
    ],
    stack: ['Python', 'Pygame'],
    testing: 'Manual gameplay testing · Physics edge cases (wall clips, ceiling collisions)',
    vcs: 'Git / GitHub',
    status: 'shipped',
    github: 'https://github.com/BlesstheGM/Super-Dupa-Game',
    demo: 'https://www.linkedin.com/posts/blessing-hlongwane-740ab426a_super-dupa-game-im-thrilled-to-unveil-ugcPost-7265255517302759427-l1KU/?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEIDsiAB3Jo_pTiEVeYxJu8HLZTkaOeY1dw',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="section-header">
        <span className="prompt">$</span>
        <span className="section-title">ls -la projects/</span>
        <span className="divider" />
      </div>

      <div className="projects-grid">
        {projects.map((p) => (
          <div key={p.name} className="project-card">
            <div className="project-bar">
              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />
              <span className="project-file">{p.filename}</span>
            </div>

            <div className="project-body">
              <div className="project-name-row">
                <span className="project-name">{p.name}</span>
                <span className={`project-status ${p.status}`}>{p.status}</span>
              </div>

              <p className="project-desc">{p.desc}</p>

              <ul className="project-highlights">
                {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>

              <div className="meta-block">
                <div className="meta-row">
                  <span className="meta-key">stack</span>
                  <div className="tags">
                    {p.stack.map((s) => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
                <div className="meta-row">
                  <span className="meta-key">testing</span>
                  <span style={{ color: 'var(--dim)', fontSize: '0.77rem' }}>{p.testing}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-key">vcs</span>
                  <span className="tag tag-g">{p.vcs}</span>
                </div>
                {p.deployment && (
                  <div className="meta-row">
                    <span className="meta-key">deploy</span>
                    <span className="tag tag-g">{p.deployment}</span>
                  </div>
                )}
              </div>

              <div className="project-footer">
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  ↗ GitHub
                </a>
                {p.demo && (
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    ↗ LinkedIn Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
