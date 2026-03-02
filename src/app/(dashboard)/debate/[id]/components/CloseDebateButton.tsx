"use client"

import { useState } from 'react'
import { Ban } from 'lucide-react'
import { closeDebateEarlyAction } from '../actions'

interface CloseDebateButtonProps {
    debateId: string
    userId: string
}

export default function CloseDebateButton({ debateId, userId }: CloseDebateButtonProps) {
    const [isClosing, setIsClosing] = useState(false)

    const handleClose = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to end this debate early?\n\nWARNING: Once closed, no more arguments can be added and this action CANNOT be undone."
        )

        if (!confirmed) return

        setIsClosing(true)
        try {
            // 1. Fast execution: Update the DB and UI immediately
            const result = await closeDebateEarlyAction(debateId)

            if (result?.error) {
                alert(result.error)
                return
            }

            // 2. Background Execution: Fire the AI Summary Webhook without awaiting it
            // This safely bypasses Vercel's strict 10s Serverless Action limits by moving the AI
            // processing into a dedicated route configured for 60-second execution.
            fetch('/api/eureka', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ debateId, closingUserId: userId }),
            }).catch(e => {
                console.error("Failed to fire background AI webhook:", e)
            })

            // The UI will refresh automatically due to the revalidatePath in closeDebateEarlyAction
        } catch (error: any) {
            alert(error.message || "Failed to close debate.")
        } finally {
            setIsClosing(false)
        }
    }

    return (
        <button
            onClick={handleClose}
            disabled={isClosing}
            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
            title="End debate early"
        >
            <Ban size={14} />
            {isClosing ? "Closing..." : "Close Early"}
        </button>
    )
}
