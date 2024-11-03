import { ErrorComponent, createFileRoute } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { ViewQuizPage } from "../../pages/ViewQuizPage";
import { getQuiz } from "../../services/quiz-service";
import { NotFound } from "../../components/NotFound";

export const Route = createFileRoute("/quiz/view/$quizId")({
    loader: async ({ params: { quizId } }) => getQuiz(Number(quizId)),
    errorComponent: ViewQuizErrorComponent,
    component: RouteComponent,
    notFoundComponent: () => {
        return <NotFound>Project not found</NotFound>;
    },
});

export function ViewQuizErrorComponent({ error }: ErrorComponentProps) {
    return <ErrorComponent error={error} />;
}

function RouteComponent() {
    const quiz = Route.useLoaderData();

    return <ViewQuizPage quiz={quiz} />;
}
