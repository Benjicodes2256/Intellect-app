'use client';

import { useState, useEffect, useRef } from 'react';
import { UserPlus, Copy, Check, X, MessageCircle } from 'lucide-react';

export default function InviteButton({ debateId, debateTopic }: { debateId: string; debateTopic: string }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const getInviteUrl = () => `${window.location.origin}/?invite=/debate/${debateId}`;

    // Close on outside click or Escape
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        const handleClick = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('keydown', handleKey);
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [open]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getInviteUrl());
            setCopied(true);
            setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
        } catch {
            prompt('Copy this invite link:', getInviteUrl());
        }
    };

    const handleWhatsApp = () => {
        const msg = encodeURIComponent(`Join me in this debate on iNTELlect!\n\n"${debateTopic}"\n\n${getInviteUrl()}`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
        setOpen(false);
    };

    return (
        <div style={{ position: 'relative' }} ref={popupRef}>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(v => !v)}
                title={`Invite someone to: ${debateTopic}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.5rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: open ? 'var(--gold)' : 'var(--sub)',
                    background: open ? 'rgba(201,151,42,0.1)' : 'var(--surf)',
                    border: `1px solid ${open ? 'rgba(201,151,42,0.35)' : 'var(--bdr)'}`,
                    padding: '0.3rem 0.7rem',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    whiteSpace: 'nowrap',
                }}
            >
                <UserPlus size={13} />
                Invite
            </button>

            {/* Popup */}
            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    zIndex: 100,
                    background: 'var(--card)',
                    border: '1px solid var(--bdr)',
                    borderRadius: '4px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                    padding: '0.85rem',
                    width: '220px',
                    animation: 'fadeInDown 0.15s ease',
                }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <span style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.48rem',
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'var(--gold)',
                        }}>
                            Invite to Debate
                        </span>
                        <button
                            onClick={() => setOpen(false)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', padding: '2px', display: 'flex' }}
                        >
                            <X size={13} />
                        </button>
                    </div>

                    {/* Topic preview */}
                    <div style={{
                        fontSize: '0.65rem',
                        color: 'var(--sub)',
                        fontStyle: 'italic',
                        marginBottom: '0.75rem',
                        lineHeight: 1.4,
                        paddingBottom: '0.65rem',
                        borderBottom: '1px solid var(--bdr)',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as any,
                    }}>
                        "{debateTopic}"
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {/* Copy Link */}
                        <button
                            onClick={handleCopy}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.55rem 0.75rem',
                                background: copied ? 'rgba(201,151,42,0.1)' : 'var(--surf)',
                                border: `1px solid ${copied ? 'rgba(201,151,42,0.3)' : 'var(--bdr)'}`,
                                borderRadius: '2px',
                                cursor: 'pointer',
                                color: copied ? 'var(--gold)' : 'var(--text)',
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                transition: 'all 0.18s',
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            {copied ? <Check size={15} /> : <Copy size={15} />}
                            {copied ? 'Link Copied!' : 'Copy Link'}
                        </button>

                        {/* WhatsApp */}
                        <button
                            onClick={handleWhatsApp}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.55rem 0.75rem',
                                background: 'rgba(37,211,102,0.08)',
                                border: '1px solid rgba(37,211,102,0.25)',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                color: '#25d366',
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                transition: 'all 0.18s',
                                width: '100%',
                                textAlign: 'left',
                            }}
                        >
                            <MessageCircle size={15} />
                            Share via WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
