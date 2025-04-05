import { ModuleStats } from '@noggin/types/module-types'
import { getCurrentDate, getDaysBetween } from './date-utils'

const LEITNER_BOXES = {
    1: { days: 1 }, // daily
    2: { days: 2 }, // every 2 days
    3: { days: 7 }, // weekly
    4: { days: 14 }, // bi-weekly
    5: { days: 30 }, // monthly
} as const

export type LeitnerBox = keyof typeof LEITNER_BOXES

export function calculateNextReviewDate(currentBox: LeitnerBox, reviewDate: Date): Date {
    const { days } = LEITNER_BOXES[currentBox]
    const nextDate = new Date(reviewDate)
    nextDate.setDate(nextDate.getDate() + days)
    return nextDate
}

export function calculatePriority(stats?: ModuleStats): number {
    if (!stats) return 0
    const now = getCurrentDate()
    const nextReview = new Date(stats.nextReviewDate)
    // Calculate days overdue (positive if past due, negative if future)
    const daysOverdue = getDaysBetween(now, nextReview)

    // Higher priority for overdue items and lower boxes
    // Add a larger base priority for overdue items
    const overduePenalty = daysOverdue > 0 ? daysOverdue * 10 : daysOverdue
    // Add a smaller adjustment based on the box number (lower box = higher priority)
    const boxBonus = (6 - stats.currentBox) * 0.1

    return overduePenalty + boxBonus
}

export function updateModuleStats(stats: ModuleStats, passed: boolean): ModuleStats {
    const currentBox = stats.currentBox as LeitnerBox
    const newBox = passed ? Math.min(currentBox + 1, 5) : 1
    const now = getCurrentDate()

    // Calculate the next review date based on the current date (`now`)
    const nextReviewDate = calculateNextReviewDate(newBox as LeitnerBox, now).toISOString()

    console.log(`Updating module stats:
      - Current box: ${currentBox} -> New box: ${newBox}
      - Passed: ${passed}
      - nextReviewDate: ${nextReviewDate}
      - Days added for next review: ${LEITNER_BOXES[newBox].days}
    `)

    return {
        ...stats,
        currentBox: newBox,
        nextReviewDate: nextReviewDate,
    }
}
