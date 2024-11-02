import { createServerFn } from "@tanstack/start";
import { NewQuiz } from "drizzle/schema";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { GenerateQuizResponse } from "~/types/quiz";

const generateQuizPrompt = (quiz: NewQuiz) =>
    `Generate a quiz title "${quiz.title}" from the following source content:\n\n${quiz.source}`;

export const generateQuiz = createServerFn(
    "POST",
    async (quiz: NewQuiz): Promise<GenerateQuizResponse | null> => {
        console.log(
            "import.meta.env.VITE_OPENAI_API_KEY",
            import.meta.env.VITE_OPENAI_API_KEY,
        );
        const client = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });

        const completion = await client.beta.chat.completions.parse({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful professor. Only use the schema for quiz responses.",
                },
                { role: "user", content: generateQuizPrompt(quiz) },
            ],
            response_format: zodResponseFormat(
                GenerateQuizResponse,
                "quizResponse",
            ),
        });

        console.log("completion", completion.choices[0]?.message);

        const message = completion.choices[0]?.message;
        if (message?.parsed) {
            return message.parsed;
        } else {
            console.log(message.refusal);
            return null;
        }
    },
);
