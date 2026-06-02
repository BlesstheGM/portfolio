const courses = [
  {
    code: 'CSC3002F',
    name: 'Operating Systems',
    topics: ['Process scheduling', 'Memory management', 'File systems', 'Concurrency & synchronisation'],
  },
  {
    code: 'CSC3003S',
    name: 'Concurrent & Parallel Programming',
    topics: ['Multithreading (Java)', 'Fork/Join framework', 'Shared memory models', 'Race conditions & locks'],
  },
  {
    code: 'CSC2002S',
    name: 'Data Structures & Algorithms',
    topics: ['Trees, graphs, heaps', 'Sorting & searching', 'Algorithm complexity', 'Dynamic programming'],
  },
  {
    code: 'INF2011',
    name: 'Software Development (Systems)',
    topics: ['SOAP & REST services', 'Systems sequence diagrams', 'UML modelling', 'Service-oriented architecture'],
  },
  {
    code: 'CSC2001F',
    name: 'Android Development',
    topics: ['Kotlin & Android SDK', 'Activity lifecycle', 'Bluetooth & networking APIs', 'UI components'],
  },
  {
    code: 'STA3030F',
    name: 'Applied Statistics & Modelling',
    topics: ['Time series analysis', 'Regression & forecasting', 'Hypothesis testing', 'Statistical inference'],
  },
  {
    code: 'CSC1016S',
    name: 'Programming in Python',
    topics: ['OOP in Python', 'File I/O', 'Data structures', 'Introductory algorithms'],
  },
  {
    code: 'CSC1015F',
    name: 'Programming in Java',
    topics: ['OOP & inheritance', 'Exception handling', 'Collections framework', 'Basic concurrency'],
  },
];

export default function Coursework() {
  return (
    <section id="coursework" className="section">
      <div className="section-header">
        <span className="prompt">$</span>
        <span className="section-title">cat coursework.md</span>
        <span className="divider" />
      </div>

      <div className="skills-grid">
        {courses.map((c) => (
          <div key={c.code} className="skill-group">
            <div className="skill-cat">{c.code} — {c.name}</div>
            <div className="skill-tags">
              {c.topics.map((t) => (
                <span key={t} className="skill-tag">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
