import { z } from "zod";

export const choiceSchema = z.object({
    text: z.string(),
    isCorrect: z.boolean(),
});

export const generatedMultipleChoiceQuestionSchema = z.object({
    question: z.string(),
    questionType: z.literal("multiple_choice"),
    choices: z.array(z.string()),
});

export const generatedWrittenQuestionSchema = z.object({
    question: z.string(),
    questionType: z.literal("written"),
});

export const generatedQuestionSchema = z.discriminatedUnion("questionType", [
    generatedMultipleChoiceQuestionSchema,
    generatedWrittenQuestionSchema,
]);

export const generatedQuizSchema = z.object({
    title: z.string(),
    questions: z.array(generatedQuestionSchema),
});

export type GeneratedChoice = z.infer<typeof choiceSchema>;
export type GeneratedWrittenQuestion = z.infer<
    typeof generatedWrittenQuestionSchema
>;
export type GeneratedMultipleChoiceQuestion = z.infer<
    typeof generatedMultipleChoiceQuestionSchema
>;
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type GeneratedQuiz = z.infer<typeof generatedQuizSchema>;
