'use client'

import { useState } from 'react'
import { reopenDebateAdminAction } from '@/app/admin/actions'
import { Unlock, Loader2 } from 'lucide-react'

export default function ReopenDebateButton({ debateId }: { debateId: string }) {
    const [loading, setLoading] = useState(false)

    async function handleReopen() {
        if (!confirm('Reopen this debate? This will delete the Eureka summary and allow new arguments.')) return

        setLoading(true)
        const res = await reopenDebateAdminAction(debateId)
        if (res?.error) {
            alert(res.error)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleReopen}
            disabled={loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(201,151,42,0.1)',
                border: '1px solid rgba(201,151,42,0.3)',
                color: 'var(--gold)',
                padding: '0.4rem 0.75rem',
                borderRadius: '2px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.62rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
            }}
        >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Unlock size={13} />}
            {loading ? 'Reopening...' : 'Admin: Reopen Debate'}
        </button>
    )
}
