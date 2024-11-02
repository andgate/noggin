import { createServerFn } from "@tanstack/start";
import { Quiz } from "drizzle/schema";

export const evaluateQuiz = createServerFn("POST", async (quiz: Quiz) => {
    console.log("evaluating quiz", quiz);
});
