export default function Footer() {
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        background: 'var(--bg)',
        borderTop: '1px solid var(--bdr)',
      }}
    >
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.5rem',
        letterSpacing: '0.1em',
        color: 'var(--sub)',
      }}>
        <strong style={{ color: 'var(--gold)' }}>INTELLECT</strong>
        &nbsp;© 2026 &nbsp;·&nbsp; Great minds discuss, debate &amp; appreciate
      </div>

      <ul style={{ display: 'flex', gap: '1.2rem', listStyle: 'none' }}>
        {['Privacy', 'Terms', 'Discord'].map(link => (
          <li key={link}>
            <a
              href="#"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.5rem',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--sub)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--sub)')}
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
