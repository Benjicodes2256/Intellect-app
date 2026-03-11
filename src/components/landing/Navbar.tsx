'use client';

import { useTheme } from './ThemeProvider';

export default function Navbar() {
  const { theme, toggle } = useTheme();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8"
      style={{
        height: '52px',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--bdr)',
      }}
    >
      <div></div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          background: 'var(--surf)',
          border: '1px solid var(--bdr)',
          borderRadius: '2px',
          padding: '0.22rem 0.55rem',
          cursor: 'pointer',
          fontFamily: "'DM Mono', monospace",
          fontSize: '0.52rem',
          letterSpacing: '0.08em',
          color: 'var(--sub)',
          transition: 'all 0.2s',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: theme === 'dark' ? 'var(--violet-lt)' : 'var(--violet)',
            flexShrink: 0,
            transition: 'background 0.3s',
            display: 'block',
          }}
        />
        {theme.toUpperCase()}
      </button>
    </header>
  );
}
