"use client"

import { X, Award, Info, AlertTriangle } from 'lucide-react'
import { REPUTATION_TIERS, DEBATE_POINTS_PER_TIER, MAX_REPUTATION_TIER } from '@/lib/reputation'
import { useEffect } from 'react'

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentTierIndex: number;
    reputationScore: number;
    nextTierTarget: number;
    tierDemotions: number;
}

export default function ReputationModal({ isOpen, onClose, currentTierIndex, reputationScore, nextTierTarget, tierDemotions }: Props) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset' };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg)] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-[var(--bdr)]">
                {/* Header */}
                <div className="p-5 border-b border-[var(--bdr)] flex justify-between items-start bg-[var(--card)]">
                    <div>
                        <div className="flex items-center gap-2 text-[var(--violet)] mb-1">
                            <Award size={18} />
                            <h2 className="font-serif font-bold text-xl text-[var(--text)]">Reputation Ladder</h2>
                        </div>
                        <p className="text-xs text-[var(--sub)] font-mono">Participate in debates to rank up.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-[var(--sub)] hover:text-[var(--text)] hover:bg-[var(--surf)] rounded-md transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-5 overflow-y-auto flex-1">
                    {/* User's Current Status Highlight */}
                    <div className="bg-[var(--violet)]/10 border border-[var(--violet)]/20 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--violet)] font-mono">Current Standing</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--sub)] font-mono">{reputationScore} Total Points</span>
                        </div>
                        <div className="font-serif text-2xl font-black text-[var(--text)] mb-3">
                            {REPUTATION_TIERS[currentTierIndex]}
                        </div>

                        {currentTierIndex < MAX_REPUTATION_TIER ? (
                            <div>
                                <div className="flex justify-between items-center text-[10px] text-[var(--sub)] font-mono mb-1">
                                    <span>Progress to {REPUTATION_TIERS[currentTierIndex + 1]}</span>
                                    <span>{nextTierTarget - reputationScore} pts away</span>
                                </div>
                                <div className="h-1.5 w-full bg-[var(--surf)] rounded-full overflow-hidden border border-[var(--bdr)]">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--violet)] to-[var(--violet-lt)] transition-all duration-1000"
                                        style={{ width: `${((reputationScore % DEBATE_POINTS_PER_TIER) / DEBATE_POINTS_PER_TIER) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-[var(--rust)] font-bold">
                                You have reached the absolute zenith of intellectual reputation.
                            </div>
                        )}

                        {tierDemotions > 0 && (
                            <div className="mt-4 pt-3 border-t border-[var(--violet)]/20 flex items-start gap-2 text-xs text-[var(--rust)]">
                                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                <span>You have suffered <strong>{tierDemotions} inactivity demotion{tierDemotions > 1 ? 's' : ''}</strong> (31+ days absent). Participate today to reset your activity timer!</span>
                            </div>
                        )}
                    </div>

                    {/* How to Earn */}
                    <div className="mb-6 bg-[var(--card)] border border-[var(--bdr)] rounded-lg p-3 flex items-start gap-3">
                        <Info size={16} className="text-[var(--gold)] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[var(--sub)] leading-relaxed">
                            <strong className="text-[var(--text)]">How it works:</strong> You earn 1 Reputation Point every time you create a debate or post a comment. 10 Points = 1 Tier Promotion. If you remain inactive for 31 days, you lose 1 Tier.
                        </p>
                    </div>

                    {/* The Tiers List */}
                    <div className="pb-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--sub)] font-mono mb-3 px-1">The 11 Intellectual Tiers</h3>
                        <div className="flex flex-col gap-2">
                            {[...REPUTATION_TIERS].reverse().map((tier, revIdx) => {
                                const actualIdx = REPUTATION_TIERS.length - 1 - revIdx;
                                const isCurrent = actualIdx === currentTierIndex;
                                const isLocked = actualIdx > currentTierIndex;
                                const ptsRequired = actualIdx * DEBATE_POINTS_PER_TIER;

                                return (
                                    <div
                                        key={tier}
                                        className={`flex items-center justify-between p-3 rounded-md border ${isCurrent
                                            ? 'bg-[var(--violet)]/10 border-[var(--violet)]/40 shadow-sm'
                                            : isLocked
                                                ? 'bg-transparent border-transparent opacity-50'
                                                : 'bg-[var(--card)] border-[var(--bdr)]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isCurrent ? 'bg-[var(--violet)] text-white' : isLocked ? 'bg-[var(--surf)] text-[var(--sub)]' : 'bg-[var(--card)] text-[var(--text)] border border-[var(--bdr)]'
                                                }`}>
                                                {actualIdx}
                                            </div>
                                            <span className={`font-serif font-bold ${isCurrent ? 'text-[var(--violet)] text-lg' : isLocked ? 'text-[var(--sub)]' : 'text-[var(--text)]'}`}>
                                                {tier}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-mono text-[var(--sub)]">
                                            {actualIdx === 10 ? '100+ pts' : `${ptsRequired} pts`}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
