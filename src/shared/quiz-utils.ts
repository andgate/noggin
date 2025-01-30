import {
    GeneratedChoice,
    GeneratedQuestion,
    GeneratedQuiz,
} from '@noggin/types/quiz-generation-types'
import { Choice, Question, Quiz } from '@noggin/types/quiz-types'
import { slugify } from './slug'

function convertChoice(choice: GeneratedChoice): Choice {
    return {
        optionText: choice.text,
    }
}

function convertQuestion(question: GeneratedQuestion): Question {
    if (question.questionType === 'multiple_choice') {
        return {
            questionType: 'multiple_choice',
            question: question.question,
            choices: question.choices.map(convertChoice),
        }
    } else {
        return {
            questionType: 'written',
            question: question.question,
        }
    }
}

function generateQuizId(title: string): string {
    const timestamp = new Date().getTime()
    const baseSlug = slugify(title || 'quiz')
    return `${baseSlug}-${timestamp}`
}

export function convertGeneratedQuiz(generated: GeneratedQuiz, sources: string[]): Quiz {
    const allQuestions = [
        ...(generated.multipleChoiceQuestions || []),
        ...(generated.writtenQuestions || []),
    ].map(convertQuestion)

    if (allQuestions.length === 0) {
        console.warn('No questions were generated in the quiz:', generated)
    }

    return {
        id: generateQuizId(generated.title),
        title: generated.title || 'Untitled Quiz',
        createdAt: new Date().toISOString(),
        timeLimit: 3600, // Default 1 hour in seconds
        sources,
        questions: allQuestions,
    }
}
