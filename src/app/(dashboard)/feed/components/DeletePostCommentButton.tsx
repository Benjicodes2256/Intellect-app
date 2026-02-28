"use client"

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deletePostCommentAction } from '../actions'

export default function DeletePostCommentButton({ commentId }: { commentId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
            return
        }

        setIsDeleting(true)
        try {
            await deletePostCommentAction(commentId)
        } catch (error: any) {
            alert(error.message || "Failed to delete comment")
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50 disabled:opacity-50"
            title="Delete Comment"
        >
            <Trash2 size={14} />
        </button>
    )
}
