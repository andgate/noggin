import { createFileRoute } from "@tanstack/react-router";
import { CreateQuizPage } from "../../pages/CreateQuiz.page";

export const Route = createFileRoute("/quiz/create")({
    component: CreateQuizPage,
});
