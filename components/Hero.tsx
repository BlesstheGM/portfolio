export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-inner">
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
            <span className="terminal-title">blessing@portfolio: ~</span>
          </div>
          <div className="terminal-body">
            <div className="t-line">
              <span className="t-prompt">$</span>
              <span className="t-cmd">whoami</span>
            </div>
            <div className="t-line">
              <span className="t-out t-blue">Blessing Hlongwane</span>
            </div>
            <div className="t-line t-blank" />
            <div className="t-line">
              <span className="t-prompt">$</span>
              <span className="t-cmd">cat role.txt</span>
            </div>
            <div className="t-line">
              <span className="t-out">Data Scientist · Full-Stack Developer</span>
            </div>
            <div className="t-line t-blank" />
            <div className="t-line">
              <span className="t-prompt">$</span>
              <span className="t-cmd">cat status.txt</span>
            </div>
            <div className="t-line">
              <span className="t-out t-warn">▶</span>
              <span className="t-out">BSc Computer Science &amp; Applied Statistics — UCT (2026)</span>
            </div>
            <div className="t-line">
              <span className="t-out t-warn">▶</span>
              <span className="t-out">Open to full-stack software engineering &amp; development roles</span>
            </div>
            <div className="t-line t-blank" />
            <div className="t-line">
              <span className="t-prompt">$</span>
              <span className="cursor" />
            </div>
          </div>
        </div>

        <h1 className="hero-name">Blessing Hlongwane</h1>
        <p className="hero-title">Data Scientist — looking for Software Engineering & Full-Stack roles</p>
        <p className="hero-location">📍 Cape Town / Johannesburg · University of Cape Town</p>

        <div className="hero-cta">
          <a href="#projects" className="btn">View Projects</a>
          <a href="#contact" className="btn btn-secondary">Contact Me</a>
          <a
            href="https://github.com/BlesstheGM"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}
