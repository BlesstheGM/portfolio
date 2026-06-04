const experience = [
  {
    company: 'Slant Research',
    location: 'Cape Town',
    role: 'Data Scientist',
    period: '2025 – May 2026',
    bullets: [
      'Monitored and maintained AWS-based data pipelines across EC2, S3, Lambda, and CloudWatch, ensuring ETL runs completed reliably',
      'Wrote SQL queries to refine categorisation algorithms and uncover insights into customer spending behaviour',
      'Authored shell and Python scripts to automate recurring pipeline tasks, cutting pipeline runtime from 3 hours to 15 minutes',
      'Refined categorisation algorithms, improving classification accuracy by 20% across key keyword categories',
      'Developed Streamlit and Metabase dashboards to surface internal insights for the wider team',
    ],
  },
  {
    company: 'University of Cape Town',
    location: 'Cape Town',
    role: 'IT Help Desk Assistant',
    period: '2024 – 2025',
    bullets: [
      'Evaluated student assignments and provided constructive, detailed written feedback',
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
