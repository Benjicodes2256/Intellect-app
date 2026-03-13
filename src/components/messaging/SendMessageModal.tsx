"use client"

import { useState } from 'react'
import { X, Send, Mail } from 'lucide-react'
import { sendMessageAction } from '@/app/(dashboard)/inbox/actions'

interface SendMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    receiverId: string;
    receiverName: string;
}

export default function SendMessageModal({ isOpen, onClose, receiverId, receiverName }: SendMessageModalProps) {
    const [content, setContent] = useState('')
    const [isSending, setIsSending] = useState(false)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSending(true)
        try {
            await sendMessageAction(receiverId, content)
            alert("Message sent successfully.")
            setContent('')
            onClose()
        } catch (error: any) {
            alert(error.message || "Failed to send message")
        } finally {
            setIsSending(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg)] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-[var(--bdr)] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-[var(--bdr)] flex justify-between items-center bg-[var(--card)]">
                    <div className="flex items-center gap-2 text-[var(--gold)]">
                        <Mail size={18} />
                        <h2 className="font-serif font-bold text-lg text-[var(--text)]">Direct Message</h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-[var(--sub)] hover:text-[var(--text)] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSend} className="p-5">
                    <div className="mb-4">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-[var(--sub)] font-mono mb-1.5">Recipient</label>
                        <div className="bg-[var(--surf)] border border-[var(--bdr)] rounded-md px-3 py-2 text-sm text-[var(--text)] font-semibold">
                            @{receiverName}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-[var(--sub)] font-mono mb-1.5">Message Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isSending}
                            placeholder="Type your message here..."
                            required
                            className="w-full bg-[var(--surf)] border border-[var(--bdr)] rounded-md p-3 text-sm text-[var(--text)] min-height-[120px] resize-none focus:outline-none focus:border-[var(--gold)] transition-all"
                            rows={4}
                        />
                        <p className="text-[9px] text-[var(--sub)] mt-2 italic font-mono">
                            Messages self-destruct after 5 days automatically.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--sub)] hover:text-[var(--text)] transition-all font-mono"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSending || !content.trim()}
                            className="bg-[var(--gold)] text-black px-5 py-2 rounded-md font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#d4a017] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? "Sending..." : "Send Message"}
                            {!isSending && <Send size={14} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
