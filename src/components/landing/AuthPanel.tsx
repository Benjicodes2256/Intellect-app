'use client';

import { SignIn, SignUp } from '@clerk/nextjs';
import { useState } from 'react';

interface AuthPanelProps { redirectUrl?: string; }

export default function AuthPanel({ redirectUrl }: AuthPanelProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const appearanceProps = {
    variables: {
      colorPrimary: '#6A4C93',
      colorBackground: '#242018',
      colorInputBackground: '#242018',
      colorInputText: '#f5f0e8',
      colorText: '#f5f0e8',
      colorTextSecondary: '#b8ad9a',
      colorDanger: '#c4582a',
      borderRadius: '2px',
      fontFamily: "'DM Sans', sans-serif",
      fontFamilyButtons: "'DM Sans', sans-serif",
    },
    elements: {
      card: {
        background: 'transparent',
        boxShadow: 'none',
        border: 'none',
        padding: '0 0.5rem',
        width: '100%',
        maxWidth: '100%',
      },
      headerTitle: { display: 'none' },
      headerSubtitle: { display: 'none' },
      logoBox: { display: 'none' },
      socialButtonsBlockButton: {
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'transparent',
        color: '#b8ad9a',
        borderRadius: '2px',
        fontSize: '0.74rem',
      },
      formFieldLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.5rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#b8ad9a',
      },
      formFieldInput: {
        background: '#242018',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '2px',
        color: '#f5f0e8',
        fontSize: '0.8rem',
      },
      formButtonPrimary: {
        background: '#6A4C93',
        borderRadius: '2px',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: '0.78rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        boxShadow: '0 0 20px rgba(106,76,147,0.22)',
      },
      footerActionLink: {
        color: '#9b78cc',
        fontSize: '0.5rem',
        display: 'none', // Hide default Clerk footer link since we handle it custom below
      },
      footerActionText: {
        display: 'none', // Hide default Clerk footer text
      },
      footer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.22rem',
        paddingBottom: '0.5rem'
      },
    },
  }

  return (
    <div
      className="anim-4 landing-auth"
      style={{ gap: '0.75rem' }}
    >
      {/* Clerk SignIn/SignUp Configured Customly */}
      {mode === 'signin' ? (
        <>
          <SignIn routing="hash" forceRedirectUrl={redirectUrl} appearance={appearanceProps} />
          <div style={{ textAlign: 'center', marginTop: '-0.5rem', fontSize: '0.75rem', color: 'var(--sub)' }}>
            Don't have an account?{' '}
            <button onClick={() => setMode('signup')} style={{ color: 'var(--violet-lt)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 600 }}>
              Sign up
            </button>
          </div>
        </>
      ) : (
        <>
          <SignUp routing="hash" forceRedirectUrl={redirectUrl} appearance={appearanceProps} />
          <div style={{ textAlign: 'center', marginTop: '-0.5rem', fontSize: '0.75rem', color: 'var(--sub)' }}>
            Already have an account?{' '}
            <button onClick={() => setMode('signin')} style={{ color: 'var(--violet-lt)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 600 }}>
              Sign in
            </button>
          </div>
        </>
      )}

      {/* Clerk note */}
      <p style={{
        textAlign: 'center',
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.5rem',
        color: 'var(--sub)',
        letterSpacing: '0.03em',
        lineHeight: 1.6,
        marginTop: '0.5rem'
      }}>
        Powered by{' '}
        <a href="https://clerk.com" target="_blank" rel="noreferrer"
          style={{ color: 'var(--violet-lt)', textDecoration: 'none' }}>
          Clerk
        </a>
      </p>
    </div>
  );
}
