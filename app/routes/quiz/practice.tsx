import { createFileRoute } from "@tanstack/react-router";
import { PracticeQuizPage } from "../../pages/PracticeQuizPage";

export const Route = createFileRoute("/quiz/practice")({
    component: PracticeQuizPage,
});
