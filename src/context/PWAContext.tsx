"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

interface PWAContextType {
    deferredPrompt: any;
    installPWA: () => Promise<void>;
    isInstallable: boolean;
    isIOS: boolean;
    isInAppBrowser: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isInAppBrowser, setIsInAppBrowser] = useState(false)

    useEffect(() => {
        // Detect iOS
        const ua = navigator.userAgent
        const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
        setIsIOS(isIOSDevice)

        // Detect in-app browsers (Instagram, FB, etc)
        const inApp = /Instagram|FBAN|FBAV|Twitter|LinkedIn|Pinterest/i.test(ua)
        setIsInAppBrowser(inApp)

        const handleBeforeInstallPrompt = (e: any) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)
            setIsInstallable(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstallable(false)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const installPWA = async () => {
        if (!deferredPrompt) return

        // Show the prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
            console.log('User accepted the PWA install')
            setIsInstallable(false)
        } else {
            console.log('User dismissed the PWA install')
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null)
    }

    return (
        <PWAContext.Provider value={{ deferredPrompt, installPWA, isInstallable, isIOS, isInAppBrowser }}>
            {children}
        </PWAContext.Provider>
    )
}

export const usePWAInstall = () => {
    const context = useContext(PWAContext)
    if (context === undefined) {
        throw new Error('usePWAInstall must be used within a PWAProvider')
    }
    return context
}
