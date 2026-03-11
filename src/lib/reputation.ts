export const REPUTATION_TIERS = [
    'Observer', // 0-9 debates
    'Novice', // 10-19 debates
    'Apprentice', // 20-29 debates
    'Rookie', // 30-39 debates
    'Challenger', // 40-49 debates
    'Pro', // 50-59 debates
    'Veteran', // 60-69 debates
    'Scholar', // 70-79 debates
    'Master', // 80-89 debates
    'Grandmaster', // 90-99 debates
    'Einstein' // 100+ debates
]

export const DEBATE_POINTS_PER_TIER = 10;
export const MAX_REPUTATION_TIER = REPUTATION_TIERS.length - 1; // 10
export const INACTIVITY_DEMOTION_DAYS = 31;

/**
 * Calculates a user's current effective Reputation Tier and progress to the next tier.
 * @param reputationScore Integer representing debates participated in (each debate = 1 score)
 * @param tierDemotions Integer representing total penalties for inactivity
 * @returns Object describing the user's tier and progression
 */
export function calculateReputationTier(reputationScore: number = 0, tierDemotions: number = 0) {
    const rawTier = Math.floor(reputationScore / DEBATE_POINTS_PER_TIER);
    const cappedRawTier = Math.min(rawTier, MAX_REPUTATION_TIER);

    // Apply demotions and ensure we don't drop below Observer (0)
    const effectiveTierIndex = Math.max(0, cappedRawTier - tierDemotions);

    const tierName = REPUTATION_TIERS[effectiveTierIndex];

    // Calculate progress
    const isMax = effectiveTierIndex === MAX_REPUTATION_TIER;
    const currentTierBasePoints = rawTier * DEBATE_POINTS_PER_TIER;
    const pointsIntoCurrentTier = reputationScore - currentTierBasePoints;
    const progressPercentage = isMax ? 100 : (pointsIntoCurrentTier / DEBATE_POINTS_PER_TIER) * 100;

    const nextTierTarget = isMax ? reputationScore : currentTierBasePoints + DEBATE_POINTS_PER_TIER;
    const pointsToNext = isMax ? 0 : nextTierTarget - reputationScore;

    return {
        tierName,
        tierIndex: effectiveTierIndex,
        reputationScore,
        progressPercentage,
        nextTierTarget,
        pointsToNext,
        isMax,
        tierDemotions
    };
}

export function checkAndApplyDemotion(lastActiveAt: string | null, currentDemotions: number = 0) {
    if (!lastActiveAt) return { applyDemotion: false };

    const lastActive = new Date(lastActiveAt).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays >= INACTIVITY_DEMOTION_DAYS) {
        return {
            applyDemotion: true,
            newDemotionsTotal: currentDemotions + 1
        };
    }

    return { applyDemotion: false };
}
