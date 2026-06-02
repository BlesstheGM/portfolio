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
          Data Scientist with <span className="hl">AWS cloud experience</span> studying
          Computer Science &amp; Applied Statistics at the{' '}
          <span className="hl-accent">University of Cape Town</span>. Looking for a{' '}
          <span className="hl">full-stack software engineering or development role</span> in
          Cape Town or Johannesburg.
        </p>
        <p>
          My projects are the best way to see what I can do — I&apos;ve built full-stack
          applications across data pipelines, web platforms, and systems engineering.
        </p>
      </div>
    </section>
  );
}
