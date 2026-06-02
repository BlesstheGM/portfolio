export default function OriginStory() {
  return (
    <section className="section" style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
      <div
        style={{
          border: '1px solid #1a1a1a',
          borderRadius: '5px',
          padding: '1.25rem 1.5rem',
          background: '#080808',
          maxWidth: '680px',
          opacity: 0.55,
        }}
      >
        <div style={{ color: '#2a4a2a', fontSize: '0.75rem', marginBottom: '0.6rem', fontFamily: 'var(--font)' }}>
          {/* hidden log */}$ grep -r &quot;origin&quot; ~/.history
        </div>
        <div style={{ color: '#2a5a2a', fontSize: '0.8rem', lineHeight: '1.8', fontFamily: 'var(--font)' }}>
          <span style={{ color: '#1e3a1e' }}># 2018 · Grade 11 · First website ever built</span>
          <br />
          <span style={{ color: '#2d4d2d' }}>
            A PHP music download site hosted on free shared hosting. No framework, no design system —
            just raw PHP, some borrowed CSS, and a very bad idea about copyright law. It worked though.
            That&apos;s where this all started.
          </span>
        </div>
      </div>
    </section>
  );
}
