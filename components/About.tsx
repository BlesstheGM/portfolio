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
          <span className="hl">Java</span>. I have been coding and building projects for the
          past 3 years. I&apos;ve built API systems, designed databases, and developed
          well-documented, Git-tracked full-stack applications. During my first internship as a
          data scientist, I worked with <span className="hl-accent">AWS instances, S3 buckets,
          and Lambdas</span>, uncovered analytics and insights in an Agile environment, and
          participated in daily Scrum meetings. Currently I&apos;m building a{' '}
          <span className="hl">REST API backend</span> for South African retail prices as a
          side project. Outside of work, I enjoy playing chess competitively and gaming.
        </p>
      </div>
    </section>
  );
}
