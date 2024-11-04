import { createServerFn } from "@tanstack/start";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
    GeneratedQuestion,
    generatedQuestionSchema,
    GeneratedQuiz,
    generatedQuizSchema,
} from "../types/quiz-generation-types";
import { z } from "zod";

const generateQuizQuestionsPrompt = (
    source: string,
    questions: GeneratedQuestion[],
    questionTypes: string[],
): string => `\
    Consider the following content:
    \n\n${source}

    ---

    We are writing a quiz to test the user's knowledge of the previous content.
    The quiz questions must be of the following types: ${questionTypes.join(", ")}.
    
    We have already generated the following questions:
    ${questions.map((question) => question.question).join("\n\n")}

    ---

    Write another question that is different from the ones above.`;

const generateQuizTitlePrompt = (
    source: string,
    questions: GeneratedQuestion[],
): string => `\
        Consider the following content:
        \n\n${source}
    
        ---
        
        Now consider the following quiz:
        \n\n${questions.map((question) => question.question).join("\n\n")}
    
        Write a title for the quiz.`;

export const generateQuiz = createServerFn(
    "POST",
    async ({
        questionCount,
        questionTypes,
        source,
    }: {
        questionCount: number;
        questionTypes: string[];
        source: string;
    }): Promise<GeneratedQuiz> => {
        const client = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });

        const generatedQuestions: GeneratedQuestion[] = await Promise.all(
            Array(questionCount).map(() =>
                generateQuestion(
                    client,
                    source,
                    generatedQuestions,
                    questionTypes,
                ),
            ),
        );

        const title = await generateQuizTitle(
            client,
            source,
            generatedQuestions,
        );

        return generatedQuizSchema.parse({
            title,
            questions: generatedQuestions,
        });
    },
);

export const generateQuestion = async (
    client: OpenAI,
    source: string,
    questions: GeneratedQuestion[],
    questionTypes: string[],
): Promise<GeneratedQuestion> => {
    const prompt = generateQuizQuestionsPrompt(
        source,
        questions,
        questionTypes,
    );
    const completion = await client.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful professor. Only use the schema for question responses.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        response_format: zodResponseFormat(
            z.object({ newQuestion: generatedQuestionSchema }),
            "questionResponse",
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

export const generateQuizTitle = async (
    client: OpenAI,
    source: string,
    questions: GeneratedQuestion[],
): Promise<string> => {
    const prompt = generateQuizTitlePrompt(source, questions);
    console.log("generateQuizTitle prompt", prompt);
    const completion = await client.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful professor. Only use the schema for quiz title responses.",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        response_format: zodResponseFormat(
            z.object({ quizTitle: z.string() }),
            "quizTitleResponse",
        ),
    });

    console.log("completion", completion.choices[0]?.message);

    const message = completion.choices[0]?.message;
    if (message?.parsed) {
        return message.parsed.quizTitle;
    } else {
        console.error(message.refusal);
        throw new Error("Failed to generate quiz");
    }
};
