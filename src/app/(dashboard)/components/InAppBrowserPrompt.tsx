"use client"

import { usePWAInstall } from '@/context/PWAContext'
import { Compass, ExternalLink, X, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function InAppBrowserPrompt() {
    const { isIOS, isInAppBrowser } = usePWAInstall()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Only show on iOS in-app browsers
        if (isIOS && isInAppBrowser) {
            const dismissed = sessionStorage.getItem('in_app_browser_prompt_dismissed')
            if (!dismissed) {
                setIsVisible(true)
            }
        }
    }, [isIOS, isInAppBrowser])

    const handleDismiss = () => {
        sessionStorage.setItem('in_app_browser_prompt_dismissed', 'true')
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[92%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-[#1c1915] border-2 border-[var(--gold)]/30 rounded-xl shadow-2xl p-4 overflow-hidden relative">
                {/* Accent Background */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--gold)]/10 to-transparent -mr-12 -mt-12 rounded-full" />
                
                <button 
                    onClick={handleDismiss}
                    className="absolute top-2 right-2 text-[var(--sub)] hover:text-[var(--text)] transition-colors p-1"
                >
                    <X size={16} />
                </button>

                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] shrink-0">
                        <Compass size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[var(--text)] mb-1 flex items-center gap-1.5">
                            Limited Browser Detected
                            <Info size={12} className="text-[var(--sub)]" />
                        </h4>
                        <p className="text-[11px] text-[var(--sub)] leading-relaxed mb-3">
                            Authentication often fails in in-app browsers (Instagram/Facebook). For the best experience, please open iNTELlect in <strong className="text-[var(--gold)]">Safari</strong>.
                        </p>
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-[var(--text)] bg-[var(--surf)] p-2 rounded-md border border-[var(--bdr)]">
                                <ExternalLink size={12} className="text-[var(--gold)]" />
                                <span>Tap <strong className="mx-1">...</strong> or <strong className="mx-1">Share</strong> & select <strong className="ml-1 text-[var(--gold)]">'Open in Browser'</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
