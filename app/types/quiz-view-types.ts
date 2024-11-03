import { z } from "zod";

export const sourceSchema = z.object({
    id: z.number(),
    content: z.string(),
    createdAt: z.string(),
});

export const choiceSchema = z.object({
    id: z.number(),
    text: z.string(),
    isCorrect: z.boolean(),
});

export const multipleChoiceQuestionSchema = z.object({
    id: z.number(),
    question: z.string(),
    questionType: z.literal("multiple_choice"),
    choices: z.array(z.string()),
});

export const writtenQuestionSchema = z.object({
    id: z.number(),
    question: z.string(),
    questionType: z.literal("written"),
});

export const questionSchema = z.discriminatedUnion("questionType", [
    multipleChoiceQuestionSchema,
    writtenQuestionSchema,
]);

export const quizSchema = z.object({
    id: z.number(),
    createdAt: z.string(),
    title: z.string(),
    source: sourceSchema,
    questions: z.array(questionSchema),
});

export type Source = z.infer<typeof sourceSchema>;
export type Choice = z.infer<typeof choiceSchema>;
export type Question = z.infer<typeof questionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
