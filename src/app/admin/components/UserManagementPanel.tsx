'use client'

import { useState } from 'react'
import { promoteUserAction, demoteUserAction, deleteUserAction } from '../actions'
import { Shield, ShieldOff, Trash2, Loader2 } from 'lucide-react'

export default function UserManagementPanel({ users }: { users: any[] }) {
    const [loading, setLoading] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const filtered = users.filter(u =>
        (u.clerk_username || '').toLowerCase().includes(search.toLowerCase())
    )

    async function handle(fn: () => Promise<void>, key: string) {
        setLoading(key)
        try { await fn() } catch (e: any) { alert(e.message) }
        setLoading(null)
    }

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search username…"
                style={{
                    width: '100%', padding: '0.5rem 0.75rem', marginBottom: '1rem',
                    background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: '2px',
                    color: 'var(--text)', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
                    outline: 'none'
                }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                {filtered.map(user => (
                    <div key={user.clerk_id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.6rem 0.75rem',
                        background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: '2px',
                        gap: '0.75rem'
                    }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {user.clerk_username || 'Unknown'}
                                {user.role === 'admin' && (
                                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.42rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--violet)', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: '2px' }}>Admin</span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--sub)', fontFamily: "'DM Mono', monospace", marginTop: '0.1rem' }}>
                                Rep: {user.reputation_score} · Truth: {user.truth_score}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                            {user.role !== 'admin' ? (
                                <button
                                    onClick={() => handle(() => promoteUserAction(user.clerk_id), `promote-${user.clerk_id}`)}
                                    disabled={!!loading}
                                    title="Promote to Admin"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', background: 'rgba(106,76,147,0.12)', border: '1px solid rgba(106,76,147,0.3)', borderRadius: '2px', cursor: 'pointer', color: 'var(--violet-lt)', fontSize: '0.62rem', fontWeight: 600 }}
                                >
                                    {loading === `promote-${user.clerk_id}` ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
                                    Promote
                                </button>
                            ) : (
                                <button
                                    onClick={() => handle(() => demoteUserAction(user.clerk_id), `demote-${user.clerk_id}`)}
                                    disabled={!!loading}
                                    title="Demote to User"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', background: 'rgba(201,151,42,0.1)', border: '1px solid rgba(201,151,42,0.3)', borderRadius: '2px', cursor: 'pointer', color: 'var(--gold)', fontSize: '0.62rem', fontWeight: 600 }}
                                >
                                    {loading === `demote-${user.clerk_id}` ? <Loader2 size={12} className="animate-spin" /> : <ShieldOff size={12} />}
                                    Demote
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (confirm(`Remove ${user.clerk_username} and all their content?`))
                                        handle(() => deleteUserAction(user.clerk_id), `delete-${user.clerk_id}`)
                                }}
                                disabled={!!loading}
                                title="Delete User"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.5rem', background: 'rgba(196,88,42,0.1)', border: '1px solid rgba(196,88,42,0.3)', borderRadius: '2px', cursor: 'pointer', color: 'var(--rust)', fontSize: '0.62rem', fontWeight: 600 }}
                            >
                                {loading === `delete-${user.clerk_id}` ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{ color: 'var(--sub)', fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>No users found</div>
                )}
            </div>
        </div>
    )
}
