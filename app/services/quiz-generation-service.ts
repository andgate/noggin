import { createServerFn } from "@tanstack/start";
import {
    GeneratedQuestion,
    generatedQuestionSchema,
    GeneratedQuiz,
    generatedQuizSchema,
} from "../types/quiz-generation-types";
import { z } from "zod";
import { generateChatCompletion } from "./openai-service";

const generateQuizQuestionsPrompt = (
    sources: string[],
    questions: GeneratedQuestion[],
    questionTypes: string[],
): string => `\
    Consider the following content:
    \n\n${sources.join("\n\n---\n\n")}

    ---

    We are writing a quiz to test the user's knowledge of the previous content.
    The quiz questions must be of the following types: ${questionTypes.join(", ")}.
    
    We have already generated the following questions:
    ${questions.map((question) => question.question).join("\n\n")}

    ---

    Write another question that is different from the ones above.`;

const generateQuizTitlePrompt = (
    sources: string[],
    questions: GeneratedQuestion[],
): string => `\
        Consider the following content:
        \n\n${sources.join("\n\n---\n\n")}
    
        ---
        
        Now consider the following quiz:
        \n\n${questions.map((question) => question.question).join("\n\n")}
    
        Write a title for the quiz.`;

export interface GenerateQuizOptions {
    questionCount: number;
    questionTypes: string[];
    sources: string[];
    controller?: AbortController;
}

export const generateQuiz = createServerFn(
    "POST",
    async ({
        questionCount,
        questionTypes,
        sources,
        controller,
    }: GenerateQuizOptions): Promise<GeneratedQuiz> => {
        console.log("Generating quiz");

        // TODO: Refactor to use async/await instead of reduce for better readability
        // TODO: Add input validation for sources and question count
        // TODO: Add rate limiting for API calls
        // TODO: Consider implementing response streaming for better UX
        const generatedQuestions = await Array.from({
            length: questionCount,
        }).reduce(
            (promise: Promise<GeneratedQuestion[]>) =>
                promise.then(async (questions) => {
                    const question = await generateQuestion({
                        sources,
                        questions,
                        questionTypes,
                        controller,
                    });
                    return [...questions, question];
                }),
            Promise.resolve([]),
        );

        const title = await generateQuizTitle({
            sources,
            questions: generatedQuestions,
            controller,
        });

        return generatedQuizSchema.parse({
            title,
            questions: generatedQuestions,
            controller,
        });
    },
);

export interface GenerateQuestionOptions {
    sources: string[];
    questions: GeneratedQuestion[];
    questionTypes: string[];
    controller?: AbortController;
}

export const generateQuestion = createServerFn<
    "POST",
    GenerateQuestionOptions,
    GeneratedQuestion
>("POST", async ({ sources, questions, questionTypes, controller }) => {
    console.log("generateQuestion called =>", {
        sources,
        questions,
        questionTypes,
    });
    const prompt = generateQuizQuestionsPrompt(
        sources,
        questions,
        questionTypes,
    );
    const question = await generateChatCompletion({
        responseFormatName: "questionResponse",
        schema: z.object({ newQuestion: generatedQuestionSchema }),
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
        controller,
    });

    console.log("question generated ==>", question.newQuestion);

    return question.newQuestion;
});

export interface GenerateQuizTitleOptions {
    sources: string[];
    questions: GeneratedQuestion[];
    controller?: AbortController;
}

export const generateQuizTitle = createServerFn<
    "POST",
    GenerateQuizTitleOptions,
    string
>("POST", async ({ sources, questions, controller }) => {
    console.log("generateQuizTitle called =>", { sources, questions });
    const prompt = generateQuizTitlePrompt(sources, questions);
    const completion = await generateChatCompletion({
        responseFormatName: "quizTitleResponse",
        schema: z.object({ quizTitle: z.string() }),
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
        controller,
    });

    console.log("quiz title generated ==>", completion.quizTitle);

    return completion.quizTitle;
});
