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
          Hi there :) I&apos;m a developer proficient in <span className="hl">Python</span> and{' '}
          <span className="hl">Java</span> with 3 years of hands-on experience. I&apos;ve designed
          databases, built API systems, and delivered well-documented, Git-tracked full-stack
          applications. At my role at <span className="hl-accent">Slant Research</span> as a data
          scientist, I worked with <span className="hl-accent">AWS EC2 instances, S3 buckets, and
          Lambdas</span>, uncovering analytics and insights in an Agile environment with daily Scrum
          meetings. Now I&apos;m working part-time as a full-stack engineer at{' '}
          <span className="hl">AuraCV.net</span>, building production systems across the entire
          stack — from <span className="hl">Node.js/TypeScript REST APIs</span>,{' '}
          <span className="hl">PostgreSQL</span> schema design, and{' '}
          <span className="hl">React</span> frontends to{' '}
          <span className="hl-accent">Google Cloud Run</span> deployments.
        </p>
      </div>
    </section>
  );
}
