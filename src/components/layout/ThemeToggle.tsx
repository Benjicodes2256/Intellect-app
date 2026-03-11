'use client';

import { useTheme } from '@/components/landing/ThemeProvider';

export default function ThemeToggle() {
    const { theme, toggle } = useTheme();
    return (
        <button
            onClick={toggle}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
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
                fontSize: '0.5rem',
                letterSpacing: '0.08em',
                color: 'var(--sub)',
                transition: 'all 0.2s',
            }}
        >
            <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: theme === 'dark' ? 'var(--violet-lt)' : 'var(--gold)',
                flexShrink: 0,
                transition: 'background 0.3s',
                display: 'block',
            }} />
            {theme.toUpperCase()}
        </button>
    );
}
