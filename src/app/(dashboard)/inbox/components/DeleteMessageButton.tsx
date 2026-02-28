"use client"

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteMessageAction } from '../actions'

export default function DeleteMessageButton({ messageId }: { messageId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!window.confirm("Delete this message permanently?")) return

        setIsDeleting(true)
        try {
            await deleteMessageAction(messageId)
        } catch (error: any) {
            alert(error.message || "Failed to delete message")
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50 disabled:opacity-50"
            title="Delete Message"
        >
            <Trash2 size={16} />
        </button>
    )
}
