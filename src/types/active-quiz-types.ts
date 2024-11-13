import { Question, Quiz } from './quiz-types'

export interface ActiveQuizState {
    quiz?: Quiz
    questions: Question[]
    studentResponses: string[]
    startTime?: string
    endTime?: string
    elapsedTime: number
}
