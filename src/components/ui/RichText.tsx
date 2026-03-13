import ReactMarkdown from 'react-markdown';

/**
 * RichText — renders markdown content with Version B editorial styling.
 * Drop-in replacement for raw {content} strings anywhere in the app.
 */
export default function RichText({ content, small }: { content: string; small?: boolean }) {
    const baseFontSize = small ? '0.72rem' : '0.85rem';

    const isHtml = content.trim().startsWith('<')

    if (isHtml) {
        return (
            <div 
                style={{ fontSize: baseFontSize, color: 'var(--text)', lineHeight: 1.7 }}
                className="prose-html"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        )
    }

    return (
        <div style={{ fontSize: baseFontSize }}>
            <ReactMarkdown
                components={{
                    p: ({ children }) => (
                        <p style={{ color: 'var(--text)', lineHeight: 1.7, marginBottom: '0.5em' }}>
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong style={{ color: 'var(--text)', fontWeight: 700 }}>
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em style={{ color: 'var(--ivory-dim)', fontStyle: 'italic' }}>
                            {children}
                        </em>
                    ),
                    h1: ({ children }) => (
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3em', fontWeight: 900, color: 'var(--text)', marginBottom: '0.4em', lineHeight: 1.2 }}>
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1em', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4em', lineHeight: 1.2 }}>
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75em', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.3em' }}>
                            {children}
                        </h3>
                    ),
                    ul: ({ children }) => (
                        <ul style={{ paddingLeft: '1.2em', marginBottom: '0.5em', display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol style={{ paddingLeft: '1.4em', marginBottom: '0.5em', display: 'flex', flexDirection: 'column', gap: '0.2em' }}>
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                            {children}
                        </li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote style={{
                            borderLeft: '2px solid var(--gold)',
                            paddingLeft: '0.75em',
                            marginLeft: 0,
                            marginBottom: '0.5em',
                            color: 'var(--sub)',
                            fontStyle: 'italic',
                        }}>
                            {children}
                        </blockquote>
                    ),
                    code: ({ children }) => (
                        <code style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.88em',
                            background: 'var(--surf)',
                            border: '1px solid var(--bdr)',
                            borderRadius: '2px',
                            padding: '0.1em 0.35em',
                            color: 'var(--violet-lt)',
                        }}>
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.8em',
                            background: 'var(--surf)',
                            border: '1px solid var(--bdr)',
                            borderRadius: '2px',
                            padding: '0.75em',
                            overflowX: 'auto',
                            marginBottom: '0.5em',
                            color: 'var(--text)',
                        }}>
                            {children}
                        </pre>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--violet-lt)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                        >
                            {children}
                        </a>
                    ),
                    hr: () => (
                        <hr style={{ border: 'none', borderTop: '1px solid var(--bdr)', margin: '0.75em 0' }} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
