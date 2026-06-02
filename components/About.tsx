export default function About() {
  return (
    <section id="about" className="section">
      <div className="section-header">
        <span className="prompt">$</span>
        <span className="section-title">cat about.txt</span>
        <span className="divider" />
      </div>

      <div className="about-text">
        <p>
          I&apos;m a <span className="hl">Data Scientist</span> studying Computer Science &amp;
          Applied Statistics at the{' '}
          <span className="hl-accent">University of Cape Town</span>, actively looking for{' '}
          <span className="hl">software engineering and full-stack development roles</span> in
          Cape Town or Johannesburg. I build things at the intersection of data, markets, and
          production infrastructure.
        </p>
        <p>
          At <span className="hl">Slant Research</span>, I improved categorization pipelines,
          monitored{' '}
          <span className="hl-accent">AWS EC2 instances, Lambda functions, and CloudWatch</span>{' '}
          alarms, built forecasting models, and delivered dashboards with Streamlit and Metabase
          that surfaced spending behaviour and market share trends.
        </p>
        <p>
          Outside of work I&apos;ve built a <span className="hl">live crypto trading bot</span>{' '}
          that plugs into Polymarket CLOB, Coinbase WebSocket feeds, and Chainlink data —
          running arbitrage, market-making, and signal-based strategies with full risk controls.
          I&apos;m also working toward my{' '}
          <span className="hl-accent">AWS Solutions Architect certification</span> and spending
          time with <span className="hl">Rust</span> for low-latency systems.
        </p>
        <p>
          I deploy on <span className="hl-accent">Vercel</span> (Next.js, edge caching, custom
          domains) and <span className="hl-accent">Render</span> (Python/FastAPI services),
          and I&apos;m comfortable with{' '}
          <span className="hl">Docker</span> for containerising pipelines and services end-to-end.
        </p>
      </div>
    </section>
  );
}
