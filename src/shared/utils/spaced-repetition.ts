import { ModuleStats } from '@/core/types/module-stats.types'
import { getCurrentDate, getDaysBetween } from './date-utils'

const LEITNER_BOXES: { [key: number]: { days: number } } = {
  1: { days: 1 }, // daily
  2: { days: 2 }, // every 2 days
  3: { days: 7 }, // weekly
  4: { days: 14 }, // bi-weekly
  5: { days: 30 }, // monthly
}

export type LeitnerBox = keyof typeof LEITNER_BOXES

export function calculateNextReviewDate(currentBox: LeitnerBox, reviewDate: Date): Date {
  const { days } = LEITNER_BOXES[currentBox]
  const nextDate = new Date(reviewDate)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

export function calculatePriority(stats: ModuleStats): number {
  const now = getCurrentDate()
  const nextReview = new Date(stats.nextReviewAt)
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
  const nextReviewAt = calculateNextReviewDate(newBox as LeitnerBox, now).toISOString()

  return {
    ...stats,
    currentBox: newBox,
    nextReviewAt: nextReviewAt,
  }
}
