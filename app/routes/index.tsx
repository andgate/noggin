import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { fetchQuizzes } from "../services/quizzes-service";
import DashboardPage from "../pages/DashboardPage";

export const Route = createFileRoute("/")({
    loader: async () => fetchQuizzes(),
    component: Index,
});

function Index() {
    const quizzes = useLoaderData({ from: "/" });
    return <DashboardPage quizzes={quizzes} />;
}
