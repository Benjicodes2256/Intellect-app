"use client"

import { MessageSquareQuote } from 'lucide-react'

export default function QuoteButton({
    debateId,
    commentId,
    authorName,
    content
}: {
    debateId: string,
    commentId: string,
    authorName: string,
    content: string
}) {
    const handleQuote = () => {
        const event = new CustomEvent('replyRequested', {
            detail: { commentId, authorName, content }
        });
        window.dispatchEvent(event);

        // Scroll to bottom form
        document.getElementById('comment-box')?.focus();
    }

    return (
        <button
            onClick={handleQuote}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#0055ff] transition-colors p-1 rounded hover:bg-blue-50"
            title="Reply"
        >
            <MessageSquareQuote size={14} /> Reply
        </button>
    )
}
