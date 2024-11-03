import { createServerFn } from "@tanstack/start";
import { Quiz } from "~/types/quiz-view-types";

export const submitQuiz = createServerFn<
    "POST",
    { quiz: Quiz; responses: string[] },
    number
>("POST", async ({ quiz, responses }) => {
    console.log("evaluating quiz", { quiz, responses });

    return 1;
});
