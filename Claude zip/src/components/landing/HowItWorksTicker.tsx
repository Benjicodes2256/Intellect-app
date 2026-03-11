const STEPS = [
  { num: '01', label: 'Start or Join a debate' },
  { num: '02', label: 'Invite your friends' },
  { num: '03', label: 'Debate' },
  { num: '04', label: 'Earn reputation points' },
  { num: '05', label: 'Grow' },
];

function TickerItems() {
  return (
    <>
      {STEPS.map((step, i) => (
        <span key={step.num} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0 2.5rem' }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.48rem',
            color: 'var(--gold)',
            fontWeight: 500,
          }}>
            {step.num}
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 500,
            color: 'var(--sub)',
            whiteSpace: 'nowrap',
          }}>
            {step.label}
          </span>
          <span style={{ color: 'var(--rust)', fontSize: '0.65rem' }}>→</span>
          {i < STEPS.length - 1 && (
            <span style={{
              color: 'var(--bdr)',
              fontSize: '0.9rem',
              opacity: 0.5,
              marginLeft: '0.8rem',
            }}>·</span>
          )}
        </span>
      ))}
    </>
  );
}

export default function HowItWorksTicker() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '34px',
        left: 0,
        right: 0,
        zIndex: 60,
        background: 'var(--card)',
        borderTop: '1px solid var(--bdr)',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Fixed label */}
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.46rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--gold)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        padding: '0 1.2rem',
        borderRight: '1px solid var(--bdr)',
      }}>
        How it works
      </span>

      {/* Scrolling track */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '1.2rem' }}>
        <div
          className="ticker-scroll"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
          }}
        >
          {/* Render twice for seamless loop */}
          <TickerItems />
          <TickerItems />
        </div>
      </div>
    </div>
  );
}
