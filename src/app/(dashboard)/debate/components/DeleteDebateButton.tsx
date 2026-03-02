"use client"

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteDebateAction } from '../actions'

interface DeleteDebateButtonProps {
    debateId: string
}

export default function DeleteDebateButton({ debateId }: DeleteDebateButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        // Prevent clicking the DebateTile overall card link
        e.preventDefault()
        e.stopPropagation()

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this debate?\n\nThis will remove all comments, AI summaries, and feed posts associated with it."
        )

        if (!confirmed) return

        setIsDeleting(true)
        try {
            const result = await deleteDebateAction(debateId)

            if (result?.error) {
                alert(result.error)
            }
        } catch (error: any) {
            alert(error.message || "Failed to delete debate")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
            title="Delete Debate"
            aria-label="Delete Debate"
        >
            <Trash2 size={16} className={isDeleting ? "animate-pulse text-red-400" : ""} />
        </button>
    )
}
