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

    </div>
  );
}
