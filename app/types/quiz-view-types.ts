import { z } from "zod";

export const sourceSchema = z.object({
    id: z.number(),
    content: z.string(),
    createdAt: z.string(),
});

export const choiceSchema = z.object({
    id: z.number(),
    optionText: z.string(),
    isCorrect: z.boolean(),
});

export const multipleChoiceQuestionSchema = z.object({
    questionType: z.literal("multiple_choice"),
    id: z.number(),
    question: z.string(),
    choices: z.array(choiceSchema),
});

export const writtenQuestionSchema = z.object({
    questionType: z.literal("written"),
    id: z.number(),
    question: z.string(),
});

export const questionSchema = z.discriminatedUnion("questionType", [
    multipleChoiceQuestionSchema,
    writtenQuestionSchema,
]);

export const quizIdSchema = z.number();

export const quizSchema = z.object({
    id: quizIdSchema,
    createdAt: z.string(),
    title: z.string(),
    sources: sourceSchema.array(),
    questions: z.array(questionSchema),
});

export type Source = z.infer<typeof sourceSchema>;
export type Choice = z.infer<typeof choiceSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuizId = z.infer<typeof quizIdSchema>;
export type Quiz = z.infer<typeof quizSchema>;
