export default function Hero() {
  return (
    <div className="anim-col-hero landing-hero">
      {/* Eyebrow */}
      <div
        className="anim-0"
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.54rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <span style={{ flexShrink: 0, width: 24, height: 1, background: 'var(--gold)', display: 'block' }} />
        The Intellectual Arena
      </div>

      {/* Headline */}
      <h1
        className="anim-1 landing-headline"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
        }}
      >
        Ideas<br />
        <em style={{ fontStyle: 'italic', color: 'var(--violet-lt)' }}>Collide</em><br />
        <span style={{ color: 'var(--rust)' }}>Here.</span>
      </h1>

      {/* Deck */}
      <p
        className="anim-2"
        style={{
          marginTop: '1rem',
          fontSize: '0.82rem',
          fontWeight: 300,
          color: 'var(--sub)',
          lineHeight: 1.65,
          borderLeft: '2px solid var(--gold)',
          paddingLeft: '0.75rem',
        }}
      >
        <strong style={{ color: 'var(--text)', fontWeight: 600 }}>Great minds</strong> discuss, debate &amp; appreciate.<br />
        AI-powered insights. Real stakes. No echo chambers.
      </p>

      {/* Stats */}
      <div
        className="anim-3"
        style={{
          display: 'flex',
          marginTop: '1.5rem',
          paddingTop: '1.2rem',
          borderTop: '1px solid var(--bdr)',
        }}
      >
        {[
          { num: '12.4K', label: 'Debaters' },
          { num: '847', label: 'Live Now' },
          { num: '3.2M', label: 'Arguments' },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              paddingRight: i < 2 ? '1rem' : 0,
              paddingLeft: i > 0 ? '1rem' : 0,
              borderRight: i < 2 ? '1px solid var(--bdr)' : 'none',
            }}
          >
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'var(--gold)',
              lineHeight: 1,
            }}>
              {s.num}
            </div>
            <div style={{
              fontSize: '0.54rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--sub)',
              marginTop: '0.1rem',
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
