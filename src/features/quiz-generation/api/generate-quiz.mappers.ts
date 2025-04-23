import { Question } from '@/core/types/question.types'
import { Quiz } from '@/core/types/quiz.types'
import { getCurrentISOString } from '@/shared/utils/date-utils'
import { v4 as uuid } from 'uuid'
import { GeneratedQuestion, GeneratedQuiz } from '../types/generated-quiz.types'

function mapGeneratedQuestionToQuestion(
  userId: string,
  quizId: string,
  timestamp: string,
  generatedQuestion: GeneratedQuestion
): Question {
  const id = uuid() // Generate a new UUID for the question
  if (generatedQuestion.questionType === 'multiple_choice') {
    return {
      id,
      quizId,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      questionText: generatedQuestion.question,
      questionType: 'multiple_choice',
      options: generatedQuestion.options,
    }
  } else {
    return {
      id,
      quizId,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      questionType: 'written',
      questionText: generatedQuestion.question,
    }
  }
}

export function mapGeneratedQuizToView(
  userId: string,
  moduleId: string,
  generated: GeneratedQuiz
): Quiz {
  const id = uuid() // Generate a new UUID for the quiz
  const timestamp = getCurrentISOString()
  const allGeneratedQuestions = [
    ...generated.multipleChoiceQuestions,
    ...generated.writtenQuestions,
  ]
  const questions = allGeneratedQuestions.map((q) =>
    mapGeneratedQuestionToQuestion(userId, id, timestamp, q)
  )

  if (questions.length === 0) {
    console.warn('No questions were generated in the quiz:', generated)
  }

  return {
    id,
    moduleId,
    userId,
    title: generated.title,
    createdAt: timestamp,
    updatedAt: timestamp,
    timeLimitSeconds: 3600, // Default 1 hour in seconds
    questions,
    submissions: [],
  }
}
