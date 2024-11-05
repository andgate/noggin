// TODO: Consider implementing response streaming for better UX
import { GeneratedQuestion, generatedQuestionSchema } from "../types/quiz-generation-types";
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

const generateQuizTitlePrompt = (sources: string[], questions: GeneratedQuestion[]): string => `\
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

export interface GenerateQuestionOptions {
    sources: string[];
    questions: GeneratedQuestion[];
    questionTypes: string[];
    controller?: AbortController;
}

export const generateQuestion = async ({
    sources,
    questions,
    questionTypes,
    controller,
}: GenerateQuestionOptions): Promise<GeneratedQuestion> => {
    console.log("generateQuestion called =>", {
        sources,
        questions,
        questionTypes,
    });
    const prompt = generateQuizQuestionsPrompt(sources, questions, questionTypes);
    const question = await generateChatCompletion({
        responseFormatName: "questionResponse",
        schema: z.object({ newQuestion: generatedQuestionSchema }),
        messages: [
            {
                role: "system",
                content: "You are a helpful professor. Only use the schema for question responses.",
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
};

export interface GenerateQuizTitleOptions {
    sources: string[];
    questions: GeneratedQuestion[];
    controller?: AbortController;
}

export const generateQuizTitle = async ({
    sources,
    questions,
    controller,
}: GenerateQuizTitleOptions): Promise<string> => {
    console.log("generateQuizTitle called =>", { sources, questions });
    const prompt = generateQuizTitlePrompt(sources, questions);
    const completion = await generateChatCompletion({
        responseFormatName: "quizTitleResponse",
        schema: z.object({ quizTitle: z.string() }),
        messages: [
            {
                role: "system",
                content: "You are a helpful professor. Only use the schema for quiz title responses.",
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
};
