import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import DashboardPage from "../pages/DashboardPage";
import { getAllQuizzes } from "~/services/quiz-service";

export const Route = createFileRoute("/")({
    loader: async () => getAllQuizzes(),
    component: Index,
});

function Index() {
    const quizzes = useLoaderData({ from: "/" });
    return <DashboardPage quizzes={quizzes} />;
}
