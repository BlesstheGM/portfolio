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
              <span className="t-out">Backend Developer · Python &amp; Java</span>
            </div>
            <div className="t-line t-blank" />
            <div className="t-line">
              <span className="t-prompt">$</span>
              <span className="t-cmd">cat about.txt</span>
            </div>
            <div className="t-line">
              <span className="t-out">Hi there :) I&apos;m a developer proficient in Python and Java. I have been</span>
            </div>
            <div className="t-line">
              <span className="t-out">coding and building projects for the past 3 years. I&apos;ve built API systems,</span>
            </div>
            <div className="t-line">
              <span className="t-out">designed databases, and developed well-documented, Git-tracked full-stack</span>
            </div>
            <div className="t-line">
              <span className="t-out">applications. During my first internship as a data scientist, I worked with</span>
            </div>
            <div className="t-line">
              <span className="t-out">AWS instances, S3 buckets, and Lambdas, uncovered analytics and insights in</span>
            </div>
            <div className="t-line">
              <span className="t-out">an Agile environment, and participated in daily Scrum meetings. Currently</span>
            </div>
            <div className="t-line">
              <span className="t-out">I&apos;m building a REST API backend for SA retail prices as a side project.</span>
            </div>
            <div className="t-line">
              <span className="t-out">Outside of work, I enjoy playing chess competitively and gaming.</span>
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
              <span className="t-out">Open to software engineering/development roles</span>
            </div>
            <div className="t-line t-blank" />
            <div className="t-line">
              <span className="t-prompt">$</span>
              <span className="cursor" />
            </div>
          </div>
        </div>

        <h1 className="hero-name">Blessing Hlongwane</h1>
        <p className="hero-title">Backend Developer — open to backend &amp; software engineering roles</p>
        <p className="hero-location">University of Cape Town</p>

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
