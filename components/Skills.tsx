const groups = [
  {
    cat: 'Languages',
    items: ['Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'Shell Scripting', 'HTML/CSS'],
  },
  {
    cat: 'APIs & Protocols',
    items: ['REST APIs', 'GraphQL', 'WebSockets', 'FastAPI', 'SOAP', 'asyncio', 'uvloop', 'Polymarket CLOB', 'Chainlink Data Feeds'],
  },
  {
    cat: 'Cloud & Infra',
    items: ['AWS EC2', 'AWS Lambda', 'CloudWatch', 'S3', 'Athena', 'Redshift', 'Docker', 'Linux', 'CI/CD Pipelines'],
  },
  {
    cat: 'Databases',
    items: ['PostgreSQL', 'MySQL', 'SQLite', 'SQLAlchemy', 'Supabase', 'Pydantic'],
  },
  {
    cat: 'Deployments',
    items: ['Vercel', 'Render', 'Custom Domains', 'Edge Caching', 'Next.js ISR', 'Docker Containers'],
  },
  {
    cat: 'Tools & Workflow',
    items: ['Git', 'GitHub', 'Docker', 'n8n', 'LLMs / AI APIs', 'Wireshark', 'Makefile'],
  },
  {
    cat: 'Data & ML',
    items: ['pandas', 'NumPy', 'Streamlit', 'Metabase', 'pytest'],
  },
  {
    cat: 'Certifications',
    items: ['LinkedIn Python Data Analysis (2024)'],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="section-header">
        <span className="prompt">$</span>
        <span className="section-title">ls skills/</span>
        <span className="divider" />
      </div>

      <div className="skills-grid">
        {groups.map((g) => (
          <div key={g.cat} className="skill-group">
            <div className="skill-cat">{g.cat}</div>
            <div className="skill-tags">
              {g.items.map((item) => (
                <span key={item} className="skill-tag">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
