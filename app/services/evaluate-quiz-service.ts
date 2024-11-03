import { createServerFn } from "@tanstack/start";

export const evaluateQuiz = createServerFn("POST", async (quiz) => {
    console.log("evaluating quiz", quiz);
});
