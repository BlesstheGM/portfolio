const experience = [
  {
    company: 'Slant Research',
    location: 'Cape Town',
    role: 'Data Scientist',
    period: '2025 – May 2026',
    bullets: [
      'Improved categorization algorithms and monitored AWS EC2 instances, CloudWatch dashboards, shell scripts, and Lambda triggers to keep data pipelines running efficiently',
      'Conducted data analytics uncovering insights into customer spending behaviour and market share trends',
      'Built operational dashboards in Streamlit and Metabase; maintained and iterated on a production forecasting model pipeline',
      'Automated infrastructure tasks using shell scripts and Lambda functions; tracked anomalies via CloudWatch alarms and S3-backed data flows',
    ],
  },
  {
    company: 'University of Cape Town',
    location: 'Cape Town',
    role: 'Computer Science Tutor',
    period: '2024 – 2025',
    bullets: [
      'Evaluated student assignments and provided constructive, detailed written feedback',
      'Supported students in understanding core CS concepts including algorithms and data structures',
    ],
  },
  {
    company: 'TomorrowTrust',
    location: 'Cape Town',
    role: 'Coding Facilitator',
    period: '2024 – Jun 2024',
    bullets: [
      'Designed and delivered lessons on HTML, CSS, and JavaScript fundamentals to high school students',
      'Facilitated hands-on coding exercises to build foundational programming intuition',
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="section-header">
        <span className="prompt">$</span>
        <span className="section-title">cat experience.log</span>
        <span className="divider" />
      </div>

      <div className="exp-list">
        {experience.map((job) => (
          <div key={job.company} className="exp-card">
            <div className="exp-header">
              <span className="exp-company">
                {job.company} <span style={{ color: 'var(--dim)', fontWeight: 'normal' }}>/ {job.location}</span>
              </span>
              <span className="exp-date">{job.period}</span>
            </div>
            <div className="exp-role">{job.role}</div>
            <ul className="exp-bullets">
              {job.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
