import { z } from 'zod'

export const gradeSchema = z.number().min(0).max(100)
export const letterGradeSchema = z.enum(['A', 'B', 'C', 'D', 'F'])

export type Grade = z.infer<typeof gradeSchema>
export type LetterGrade = z.infer<typeof letterGradeSchema>
