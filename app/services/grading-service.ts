import { createServerFn } from "@tanstack/start";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";
import {
    gradedResponseSchema,
    GradedResponse,
    GradedSubmission,
} from "~/types/quiz-generation-types";
import { Question, Quiz } from "~/types/quiz-view-types";

const gradeQuizQuestionPrompt = (
    sources: string[],
    question: Question,
    response: string,
): string => `\
    \n\n${sources.join("\n\n---\n\n")}

    ---

    Please grade the following question and response based on the content above.
    
    Question: ${question.question}
    Response: ${response}
`;

export const gradeQuiz = createServerFn<
    "POST",
    { quiz: Quiz; responses: string[] },
    GradedSubmission
>("POST", async ({ quiz, responses }) => {
    console.log("grading quiz", { quiz, responses });
    const client = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });

    const gradedResponses = await Promise.all(
        responses.map((response, i) =>
            gradeResponse(
                client,
                quiz.sources.map((source) => source.content),
                quiz.questions[i],
                response,
            ),
        ),
    );

    // We could also
    const grade = gradedResponses.reduce((acc, curr) => acc + curr.score, 0);

    return { responses: gradedResponses, grade };
});

export const gradeResponse = async (
    client: OpenAI,
    sources: string[],
    question: Question,
    response: string,
): Promise<GradedResponse> => {
    const prompt = gradeQuizQuestionPrompt(sources, question, response);
    const completion = await client.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful professor. Only use the schema for graded responses.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        response_format: zodResponseFormat(
            z.object({ newQuestion: gradedResponseSchema }),
            "gradedResponse",
        ),
    });

    const message = completion.choices[0]?.message;
    if (message?.parsed) {
        return message.parsed.newQuestion;
    } else {
        console.error(message.refusal);
        throw new Error("Failed to generate quiz");
    }
};
