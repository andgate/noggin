import { QuizGeneratorProvider } from '@renderer/hooks/use-quiz-generator'
import { createFileRoute } from '@tanstack/react-router'
import { CreateQuizPage } from '../../pages/CreateQuiz.page'

export const Route = createFileRoute('/quiz/create')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <QuizGeneratorProvider>
            <CreateQuizPage />
        </QuizGeneratorProvider>
    )
}
