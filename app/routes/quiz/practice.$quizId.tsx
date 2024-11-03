import { ErrorComponent, createFileRoute } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { PracticeQuizPage } from "../../pages/PracticeQuizPage";
import { getQuiz } from "../../services/quiz-service";
import { NotFound } from "../../components/NotFound";

export const Route = createFileRoute("/quiz/practice/$quizId")({
    loader: async ({ params: { quizId } }) => getQuiz(Number(quizId)),
    errorComponent: PracticeQuizErrorComponent,
    component: RouteComponent,
    notFoundComponent: () => {
        return <NotFound>Quiz not found</NotFound>;
    },
});

export function PracticeQuizErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />;
}

function RouteComponent() {
    const quiz = Route.useLoaderData();
    console.log("RouteComponent practice quiz ==>", quiz);

    return <PracticeQuizPage quiz={quiz} />;
}
