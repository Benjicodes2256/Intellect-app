"use client"

import { useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride'
import { useRouter } from 'next/navigation'
import { completeOnboardingAction } from './actions'

export default function OnboardingTour({ userId, completedOnboarding }: { userId: string, completedOnboarding: boolean }) {
    const [run, setRun] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
        // Run the tour only if we are absolutely sure they haven't completed it
        if (!completedOnboarding && userId) {
            // Slight delay so the UI fully mounts first
            const timer = setTimeout(() => {
                setRun(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [completedOnboarding, userId])

    if (!isMounted) return null

    const steps: Step[] = [
        {
            content: (
                <div className="text-left">
                    <h3 className="font-bold text-lg mb-2 text-[#0055ff]">Welcome to iNTELlect!</h3>
                    <p className="text-sm text-gray-700">We're so glad you're here. Let's take a quick 30 second tour to show you how to dominate logic and earn Reputation on the platform.</p>
                </div>
            ),
            placement: 'center',
            target: 'body',
        },
        {
            target: '.tour-feed-nav',
            content: (
                <div className="text-left">
                    <h3 className="font-bold text-md mb-1 text-gray-900">The Social Feed</h3>
                    <p className="text-sm text-gray-600">The core of the platform. Drop your raw logic and fact-check others cleanly without clutter. Hit 'Like' to show support, or 'Reply' to jump into threaded debates.</p>
                </div>
            ),
            placement: 'top',
        },
        {
            target: '.tour-debate-nav',
            content: (
                <div className="text-left">
                    <h3 className="font-bold text-md mb-1 text-gray-900">The Debate Arena</h3>
                    <p className="text-sm text-gray-600">Got a hot take? Launch an official Master Debate. They last for 1 to 5 days, and your Truth Score depends on winning these battles of logic.</p>
                </div>
            ),
            placement: 'top',
        },
        {
            target: '.tour-inbox-nav',
            content: (
                <div className="text-left">
                    <h3 className="font-bold text-md mb-1 text-gray-900">Secure Inbox</h3>
                    <p className="text-sm text-gray-600">Found someone interesting? Slide into their encrypted direct messages to chat one-on-one.</p>
                </div>
            ),
            placement: 'top',
        },
        {
            target: '.tour-profile-nav',
            content: (
                <div className="text-left">
                    <h3 className="font-bold text-md mb-1 text-gray-900">Your Identity</h3>
                    <p className="text-sm text-gray-600">Click right here to access your logic dashboard. You can track your Reputation Score, monitor your Fact-Check accuracy, and manage your account.</p>
                </div>
            ),
            placement: 'top',
        },
        {
            target: '.tour-suggestion-box',
            content: (
                <div className="text-left">
                    <h3 className="font-bold text-md mb-1 text-gray-900">Send Us Ideas!</h3>
                    <p className="text-sm text-gray-600">On your Profile page, you'll find a 'Submit Suggestion' box. Any ideas you drop there get routed as a Direct Message straight to the Admin team. We love seeing your ideas!</p>
                </div>
            ),
            placement: 'top-start',
        }
    ]

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

        if (finishedStatuses.includes(status)) {
            setRun(false)
            // Fire API to save to DB so they don't see this again
            await completeOnboardingAction()
            // Optional: force a refresh or navigation
            router.refresh()
        }
    }

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            run={run}
            scrollToFirstStep
            showProgress
            showSkipButton
            steps={steps}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#0055ff',
                    textColor: '#333',
                    overlayColor: 'rgba(0, 0, 0, 0.6)',
                },
                tooltipContainer: {
                    textAlign: 'left'
                },
                buttonNext: {
                    backgroundColor: '#0055ff',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    borderRadius: '8px'
                },
                buttonBack: {
                    marginRight: 10,
                    color: '#666'
                }
            }}
        />
    )
}
