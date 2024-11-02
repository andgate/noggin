import { createFileRoute } from "@tanstack/react-router";
import { CreateQuizPage } from "../../pages/CreateQuizPage";

export const Route = createFileRoute("/quiz/create")({
    component: CreateQuizPage,
});
