"use client"

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deletePostAction } from '../actions'

export default function DeletePostButton({ postId }: { postId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            return
        }

        setIsDeleting(true)
        try {
            await deletePostAction(postId)
        } catch (error: any) {
            alert(error.message || "Failed to delete post")
            setIsDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-red-50 disabled:opacity-50"
            title="Delete Post"
        >
            <Trash2 size={16} />
        </button>
    )
}
