"use client"

import { MessageSquare, Flame, Inbox, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export function BottomNav() {
    const pathname = usePathname()

    const navItems = [
        { name: 'Debate', path: '/debate', icon: Flame, tourClass: 'tour-debate-nav' },
        { name: 'Feed', path: '/feed', icon: MessageSquare, tourClass: 'tour-feed-nav' },
        { name: 'Inbox', path: '/inbox', icon: Inbox, tourClass: 'tour-inbox-nav' },
        { name: 'Profile', path: '/profile', icon: User, tourClass: 'tour-profile-nav' },
    ]

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            width: '100%',
            background: 'var(--card)',
            borderTop: '1px solid var(--bdr)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingTop: '0.5rem',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 50,
        }}>
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path)
                const Icon = item.icon
                return (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={item.tourClass}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '2px',
                            transition: 'all 0.2s',
                            color: isActive ? 'var(--gold)' : 'var(--sub)',
                            background: isActive ? 'rgba(201,151,42,0.08)' : 'transparent',
                            textDecoration: 'none',
                        }}
                    >
                        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        <span style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 'var(--fs-xs)',
                            fontWeight: 500,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                        }}>{item.name}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
