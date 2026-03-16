"use client"

import { Users, Activity, MessageSquare, Flame, Lock } from 'lucide-react'

interface Stat {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    action?: string;
}

interface AdminKPICardsProps {
    stats: Stat[];
}

export default function AdminKPICards({ stats }: AdminKPICardsProps) {
    const handleCardClick = (action?: string) => {
        if (action) {
            document.getElementById(action)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {stats.map(stat => (
                <div 
                    key={stat.label} 
                    style={{ 
                        background: 'var(--card)', 
                        border: '1px solid var(--bdr)', 
                        borderRadius: '4px', 
                        padding: '1rem', 
                        cursor: stat.action ? 'pointer' : 'default',
                        transition: 'transform 0.2s, border-color 0.2s'
                    }}
                    onClick={() => handleCardClick(stat.action)}
                    onMouseEnter={(e) => {
                        if (stat.action) {
                            e.currentTarget.style.borderColor = 'var(--gold)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (stat.action) {
                            e.currentTarget.style.borderColor = 'var(--bdr)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }
                    }}
                >
                    <div style={{ color: stat.color, marginBottom: '0.4rem' }}>{stat.icon}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.46rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sub)', marginTop: '0.25rem' }}>{stat.label}</div>
                </div>
            ))}
        </div>
    );
}
