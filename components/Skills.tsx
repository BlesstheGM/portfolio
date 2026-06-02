const groups = [
  {
    cat: 'Languages',
    items: ['Python', 'Rust', 'Java', 'Kotlin', 'C# .NET', 'JavaScript', 'SQL', 'Shell Scripting', 'HTML/CSS'],
  },
  {
    cat: 'Data & ML',
    items: ['pandas', 'NumPy', 'Streamlit', 'Metabase', 'Superset', 'Matplotlib', 'scikit-learn', 'pytest'],
  },
  {
    cat: 'Cloud & Infra',
    items: ['AWS EC2', 'AWS Lambda', 'CloudWatch', 'S3', 'Athena', 'Redshift', 'Docker', 'Linux', 'CI/CD Pipelines'],
  },
  {
    cat: 'APIs & Protocols',
    items: ['WebSockets', 'REST APIs', 'SOAP', 'Polymarket CLOB', 'Chainlink Data Feeds', 'Polygon Alchemy RPC', 'FastAPI', 'asyncio', 'uvloop'],
  },
  {
    cat: 'Databases',
    items: ['MySQL', 'SQLite', 'SQLAlchemy', 'PostgreSQL', 'Pydantic'],
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
