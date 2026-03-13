"use client"

import React, { useState, useEffect } from 'react'
import { Smartphone, Download, Share, PlusSquare, X } from 'lucide-react'
import { usePWAInstall } from '@/context/PWAContext'
import { clsx } from 'clsx'

export default function PWAAnnouncement() {
    const { isInstallable, installPWA, isIOS } = usePWAInstall()
    const [isDismissed, setIsDismissed] = useState(true) // Default to true until we check localstorage
    const [showInstructions, setShowInstructions] = useState(false)

    useEffect(() => {
        const dismissed = localStorage.getItem('pwa_announcement_dismissed')
        if (!dismissed) {
            setIsDismissed(false)
        }
    }, [])

    const handleDismiss = () => {
        localStorage.setItem('pwa_announcement_dismissed', 'true')
        setIsDismissed(true)
    }

    if (isDismissed) return null
    if (!isInstallable && !isIOS) return null

    return (
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#0055ff]/20 p-4 transition-all mb-6 relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0055ff]/5 to-[#ff5500]/5 -mr-16 -mt-16 rounded-full" />
            
            <button 
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 transition-colors p-1"
                title="Dismiss"
            >
                <X size={16} />
            </button>

            <div className="flex items-start gap-4 pr-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0055ff] to-[#ff5500] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Smartphone size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900">System Announcement</span>
                        <span className="bg-[#0055ff]/10 text-[#0055ff] text-[10px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">New Feature</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Intellect is now downloadable!</h4>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                        Take the high-fidelity debate floor wherever you go. "Install" Intellect as an app for full-screen immersive discussions and instant access.
                    </p>

                    {isInstallable ? (
                        <button
                            onClick={installPWA}
                            className="bg-[#0055ff] hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                        >
                            <Download size={14} />
                            Download App
                        </button>
                    ) : isIOS ? (
                        <div>
                            <button
                                onClick={() => setShowInstructions(!showInstructions)}
                                className="text-[#0055ff] text-xs font-bold flex items-center gap-2 hover:underline"
                            >
                                <Download size={14} />
                                How to install on iOS
                            </button>

                            {showInstructions && (
                                <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 text-[10px] text-gray-700">
                                        <Share size={12} className="text-gray-400" />
                                        <span>Tap <strong>Share</strong> in Safari</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-700">
                                        <PlusSquare size={12} className="text-gray-400" />
                                        <span>Select <strong>'Add to Home Screen'</strong></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
