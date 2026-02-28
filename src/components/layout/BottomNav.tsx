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
        <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center z-50">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path)
                const Icon = item.icon
                return (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={clsx(
                            item.tourClass,
                            'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                            isActive
                                ? 'text-[#ff5500] bg-[rgba(255,85,0,0.1)]'
                                : 'text-gray-500 hover:text-gray-900'
                        )}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-xs font-semibold">{item.name}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
