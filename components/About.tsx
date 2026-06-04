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
          Backend developer proficient in <span className="hl">Python</span> and{' '}
          <span className="hl">Java</span>. I ship APIs, design databases, and know my way
          around WebSockets and real-time systems. At{' '}
          <span className="hl-accent">Slant Research</span> I worked with AWS in an agile
          environment with daily scrum meetings. Now I&apos;m building a{' '}
          <span className="hl">FastAPI-powered REST backend</span> aggregating South African
          retail prices.
        </p>
      </div>
    </section>
  );
}
