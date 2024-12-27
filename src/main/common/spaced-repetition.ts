import { ModuleStats } from '@noggin/types/module-types'

const LEITNER_BOXES = {
    1: { days: 1 }, // daily
    2: { days: 2 }, // every 2 days
    3: { days: 7 }, // weekly
    4: { days: 14 }, // bi-weekly
    5: { days: 30 }, // monthly
} as const

export type LeitnerBox = keyof typeof LEITNER_BOXES

export function calculateNextReviewDate(currentBox: LeitnerBox, lastReviewDate: Date): Date {
    const { days } = LEITNER_BOXES[currentBox]
    const nextDate = new Date(lastReviewDate)
    nextDate.setDate(nextDate.getDate() + days)
    return nextDate
}

export function calculatePriority(stats: ModuleStats): number {
    const now = new Date()
    const nextReview = new Date(stats.nextDueDate)
    const daysOverdue = (now.getTime() - nextReview.getTime()) / (1000 * 60 * 60 * 24)

    // Higher priority for overdue items and lower boxes
    return daysOverdue + (6 - stats.currentBox) * 0.1
}

export function updateModuleStats(stats: ModuleStats, passed: boolean): ModuleStats {
    const currentBox = stats.currentBox as LeitnerBox
    const newBox = passed ? Math.min(currentBox + 1, 5) : 1

    return {
        ...stats,
        currentBox: newBox,
        lastReviewDate: new Date().toISOString(),
        nextDueDate: calculateNextReviewDate(newBox as LeitnerBox, new Date()).toISOString(),
    }
}
