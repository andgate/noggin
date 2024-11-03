import { insertMultipleChoiceOptionSchema } from "drizzle/schema/choices";
import { insertQuestionSchema } from "drizzle/schema/question";
import { insertQuizSchema } from "drizzle/schema/quiz";
import { z } from "zod";

export const generateQuizRequestSchema = insertQuizSchema.pick({
    title: true,
    questionCount: true,
});
export const generateQuizResponseSchema = z.object({
    quiz: insertQuizSchema.pick({ title: true }),
    questions: insertQuestionSchema
        .pick({ question: true, questionType: true })
        .extend({ choices: z.array(z.string()) })
        .array(),
    multipleChoiceOptions: insertMultipleChoiceOptionSchema.array(),
});

export type GenerateQuizRequest = z.infer<typeof generateQuizRequestSchema>;
export type GenerateQuizResponse = z.infer<typeof generateQuizResponseSchema>;

export const generateQuizNameResponseSchema = z.object({ name: z.string() });
export const generateQuizQuestionResponseSchema = z.object({
    question: z.string(),
    questionType: z.string(),
    choices: z.array(z.string()),
});
