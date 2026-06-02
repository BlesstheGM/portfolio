export default function Contact() {
  return (
    <section id="contact" className="section">
      <div className="section-header">
        <span className="prompt">$</span>
        <span className="section-title">cat contact.txt</span>
        <span className="divider" />
      </div>

      <div className="contact-box">
        <div className="contact-row">
          <span className="contact-label">email</span>
          <a href="mailto:blessinghlongwane40@gmail.com" className="contact-val">
            blessinghlongwane40@gmail.com
          </a>
        </div>
        <div className="contact-row">
          <span className="contact-label">phone</span>
          <a href="tel:+27796895087" className="contact-val">+27 79 689 5087</a>
        </div>
        <div className="contact-row">
          <span className="contact-label">github</span>
          <a
            href="https://github.com/BlesstheGM"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-val"
          >
            github.com/BlesstheGM ↗
          </a>
        </div>
        <div className="contact-row">
          <span className="contact-label">linkedin</span>
          <a
            href="https://www.linkedin.com/in/blessing-hlongwane-740ab426a"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-val"
          >
            linkedin.com/in/blessing-hlongwane ↗
          </a>
        </div>
        <div className="contact-row">
          <span className="contact-label">location</span>
          <span className="contact-val" style={{ cursor: 'default' }}>Cape Town, South Africa</span>
        </div>
        <div className="contact-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <span className="contact-label">reference</span>
          <span className="contact-val" style={{ cursor: 'default', color: 'var(--dim)', fontSize: '0.84rem' }}>
            Bafana Makondo — Data Scientist, Absa —{' '}
            <a href="mailto:Bafana.Makondo@gmail.com" className="contact-val" style={{ fontSize: '0.84rem' }}>
              Bafana.Makondo@gmail.com
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
