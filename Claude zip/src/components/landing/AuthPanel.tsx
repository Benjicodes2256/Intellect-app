import { SignIn } from '@clerk/nextjs';

export default function AuthPanel() {
  return (
    <div
      className="anim-4"
      style={{
        padding: '0 2rem 0 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      {/* Heading */}
      <div style={{ marginBottom: '0.1rem' }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.45rem',
          fontWeight: 700,
          fontStyle: 'italic',
          color: 'var(--text)',
          lineHeight: 1,
        }}>
          Enter the Arena
        </h2>
        <p style={{
          fontSize: '0.64rem',
          fontWeight: 300,
          color: 'var(--sub)',
          marginTop: '0.22rem',
          letterSpacing: '0.04em',
        }}>
          Great minds discuss, debate &amp; appreciate
        </p>
      </div>

      {/* Clerk SignIn — appearance customised to match Version B palette */}
      <SignIn
        routing="hash"
        appearance={{
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
              padding: 0,
            },
            headerTitle: { display: 'none' },
            headerSubtitle: { display: 'none' },
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
            },
            footer: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.22rem',
            },
          },
        }}
      />

      {/* Clerk note */}
      <p style={{
        textAlign: 'center',
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.5rem',
        color: 'var(--sub)',
        letterSpacing: '0.03em',
        lineHeight: 1.6,
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
