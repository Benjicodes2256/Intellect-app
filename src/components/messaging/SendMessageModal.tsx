"use client"

import { useState, useEffect } from 'react'
import { X, Send, User } from 'lucide-react'
import { sendMessageAction } from '@/app/(dashboard)/inbox/actions'

interface Props {
    isOpen: boolean;
    onClose: () => void;
    receiverId: string;
    receiverName: string;
}

export default function SendMessageModal({ isOpen, onClose, receiverId, receiverName }: Props) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setContent('');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset' };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            await sendMessageAction(receiverId, content)
            onClose()
            // Optionally show a toast or success message here
        } catch (error: any) {
            alert(error.message || "Failed to send message")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg)] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[var(--bdr)]">
                {/* Header */}
                <div className="p-4 border-b border-[var(--bdr)] flex justify-between items-center bg-[var(--card)]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--violet)]/10 flex items-center justify-center text-[var(--violet)]">
                            <User size={16} />
                        </div>
                        <div>
                            <h2 className="font-serif font-bold text-lg text-[var(--text)]">Direct Message</h2>
                            <p className="text-[10px] text-[var(--sub)] font-mono uppercase tracking-wider">To: @{receiverName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-[var(--sub)] hover:text-[var(--text)] hover:bg-[var(--surf)] rounded-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4">
                    <textarea
                        autoFocus
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`Message @${receiverName}...`}
                        className="w-full min-h-[150px] p-3 text-sm bg-[var(--surf)] border border-[var(--bdr)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--violet)]/20 transition-all resize-none text-[var(--text)]"
                        disabled={isSubmitting}
                    />

                    <div className="flex justify-end mt-4 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold text-[var(--sub)] hover:text-[var(--text)] transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="flex items-center gap-2 bg-[var(--violet)] hover:bg-[var(--violet-lt)] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg shadow-[var(--violet)]/20 disabled:opacity-50 disabled:shadow-none transition-all"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                            {!isSubmitting && <Send size={14} />}
                        </button>
                    </div>
                </form>

                <div className="p-3 bg-[var(--card)] border-t border-[var(--bdr)]">
                    <p className="text-[9px] text-[var(--sub)] text-center font-serif italic">
                        Messages are private and self-destruct after 5 days.
                    </p>
                </div>
            </div>
        </div>
    )
}
