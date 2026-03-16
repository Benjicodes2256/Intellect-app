"use client"

import { useState } from 'react'
import { Lock, ChevronDown, ChevronUp, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function PrivateDebatesPanel({ privateDebates }: { privateDebates: any[] }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [search, setSearch] = useState('')

    const filtered = privateDebates.filter(d => 
        d.topic.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div id="private-debates-section" style={{ background: 'var(--card)', border: '1px solid var(--rust)', borderRadius: '4px', padding: '1.25rem', marginTop: '1rem', transition: 'all 0.3s' }}>
            <div 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} style={{ color: 'var(--rust)' }} />
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Private Debate Topics</h2>
                    <span style={{ background: 'var(--rust)', color: 'white', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
                        {privateDebates.length}
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--sub)' }} /> : <ChevronDown size={18} style={{ color: 'var(--sub)' }} />}
            </div>
            
            <p style={{ fontSize: '0.65rem', color: 'var(--sub)', marginTop: '0.25rem' }}>View the logic and reasoning behind private discussions.</p>

            {isExpanded && (
                <div className="animate-in fade-in duration-300" style={{ marginTop: '1.25rem' }}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <input 
                            type="text" 
                            placeholder="Search private topics..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: '2px', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--text)', outline: 'none' }}
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: 'var(--sub)', fontSize: '0.72rem', border: '1px dashed var(--bdr)', borderRadius: '2px' }}>
                            No private debates found matching that search.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {filtered.map(debate => (
                                <div key={debate.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: '2px', transition: 'border-color 0.2s' }}>
                                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                                        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.2rem' }}>{debate.topic}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontFamily: "'DM Mono', monospace", fontSize: '0.5rem', color: 'var(--sub)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                <Calendar size={10} />
                                                <span>{new Date(debate.created_at).toLocaleDateString()}</span>
                                            </div>
                                            {debate.is_closed ? (
                                                <span style={{ color: 'var(--sub)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '1px' }}>CLOSED</span>
                                            ) : (
                                                <span style={{ color: 'var(--gold)', background: 'rgba(201,151,42,0.1)', padding: '0.1rem 0.3rem', borderRadius: '1px' }}>ACTIVE</span>
                                            )}
                                        </div>
                                    </div>
                                    <Link href={`/debate/${debate.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: '2px', color: 'var(--sub)', transition: 'all 0.2s' }}>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
