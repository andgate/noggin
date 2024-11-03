import { createFileRoute } from "@tanstack/react-router";
import { QuizResultsPage } from "../../pages/QuizResultsPage";

export const Route = createFileRoute("/quiz/results/$submissionId")({
    component: QuizResultsPage,
});
