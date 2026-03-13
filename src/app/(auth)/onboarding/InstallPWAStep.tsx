"use client"

import React, { useState } from 'react'
import { Download, Smartphone, Share, PlusSquare } from 'lucide-react'
import { usePWAInstall } from '@/context/PWAContext'

export default function InstallPWAStep() {
    const { isInstallable, installPWA, isIOS } = usePWAInstall()
    const [showInstructions, setShowInstructions] = useState(false)

    // If it's not installable and not iOS (meaning it's already installed or not supported), don't show anything
    if (!isInstallable && !isIOS) return null

    return (
        <div className="bg-gradient-to-br from-[#0055ff]/10 to-[#ff5500]/10 border border-[#0055ff]/20 rounded-2xl p-6 mb-8 text-center animate-in zoom-in-95 duration-500">
            <div className="bg-white p-3 rounded-2xl inline-block shadow-sm mb-4">
                <Smartphone className="text-[#0055ff]" size={32} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Get the Intellect App</h3>
            <p className="text-sm text-gray-600 mb-6 px-4">
                For a faster, more focused experience, download Intellect directly to your home screen.
            </p>

            {isInstallable ? (
                <button
                    onClick={installPWA}
                    className="flex items-center gap-2 bg-[#0055ff] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl mx-auto transition-all transform hover:scale-105 shadow-md"
                >
                    <Download size={18} />
                    Install App
                </button>
            ) : isIOS ? (
                <div className="bg-white/50 p-4 rounded-xl border border-white/80">
                    <button 
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="text-[#0055ff] font-bold text-sm flex items-center justify-center gap-2 mx-auto"
                    >
                        <Download size={18} />
                        How to Install on iPhone
                    </button>
                    
                    {showInstructions && (
                        <div className="mt-4 text-left space-y-3 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center gap-3 text-xs text-gray-700">
                                <div className="bg-white p-1 rounded border border-gray-100"><Share size={14} /></div>
                                <span>1. Tap the <strong>Share</strong> button at the bottom of Safari.</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-700">
                                <div className="bg-white p-1 rounded border border-gray-100"><PlusSquare size={14} /></div>
                                <span>2. Select <strong>'Add to Home Screen'</strong> from the menu.</span>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    )
}
