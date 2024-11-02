import { z } from "zod";

export const GenerateQuizQuestion = z.object({
    id: z.number(),
    text: z.string(),
    options: z.array(z.string()),
    correctOption: z.string(),
});

export type GenerateQuizQuestion = z.infer<typeof GenerateQuizQuestion>;

export const GenerateQuizResponse = z.object({
    questions: z.array(GenerateQuizQuestion),
});

export type GenerateQuizResponse = z.infer<typeof GenerateQuizResponse>;
