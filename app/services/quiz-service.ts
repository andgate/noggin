import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import db from "drizzle/db";
import {
    MultipleChoiceOptionTable,
    selectMultipleChoiceOptionSchema,
} from "drizzle/schema/choices";
import { QuestionTable, selectQuestionSchema } from "drizzle/schema/question";
import { QuizTable, selectQuizSchema } from "drizzle/schema/quiz";
import { z } from "zod";
import { Quiz, quizSchema } from "~/types/quiz-view-types";

// Schemas
export const getQuizQueryResultSchema = z.object({
    quiz: selectQuizSchema,
    questions: selectQuestionSchema.array(),
    multipleChoiceOptions: selectMultipleChoiceOptionSchema.array(),
});

export const getQuizRequestSchema = z.object({ quizId: z.number() });

export const getAllQuizzesResponseSchema = selectQuizSchema.array();

export const createQuizRequestSchema = generateQuizResponseSchema;
export const createQuizResponseSchema = selectQuizSchema;

// Types
export type GetQuizRequest = z.infer<typeof getQuizRequestSchema>;
export type GetAllQuizzesResponse = z.infer<typeof getAllQuizzesResponseSchema>;
export type CreateQuizRequest = z.infer<typeof createQuizRequestSchema>;
export type CreateQuizResponse = z.infer<typeof createQuizResponseSchema>;

// Pipelines
export const getQuizQueryResultSchema = selectQuizSchema
    .transform((quizDbRow): Quiz => {
        const { id, createdAt, title } = quizDbRow;
        return { id, createdAt, title };
    })
    .pipe(quizSchema);

/**
 * Fetches a single quiz by its ID.
 * @param quizId - The ID of the quiz to fetch.
 * @returns A Promise that resolves to the quiz data.
 */
export const getQuiz = createServerFn(
    "GET",
    async ({ id: quizId }: Quiz): Promise<Quiz> => {
        console.info(`Fetching quiz with id ${quizId}...`);

        try {
            const quiz = await db
                .select()
                .from(QuizTable)
                .where(eq(QuizTable.id, quizId))
                .get();

            if (!quiz) {
                throw new Error("Quiz not found");
            }

            console.log("[quiz] ==>", quiz);

            return quiz;
        } catch (error) {
            console.error("Error fetching quiz:", error);
            throw new Error("Failed to fetch quiz");
        }
    },
);

/**
 * Fetches all quizzes.
 * @returns A Promise that resolves to an array of quiz data.
 */
export const getAllQuizzes = createServerFn<
    "GET",
    undefined,
    GetQuizResponse[]
>("GET", async (): Promise<GetAllQuizzesResponse> => {
    console.info("Fetching quizzes...");

    try {
        const allQuizzes = await db.select().from(QuizTable).all();
        console.log("[quizzes] ==>", allQuizzes);
        return allQuizzes;
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        return [];
    }
});

/**
 * Creates a new quiz.
 * @param quizData - The data for the new quiz.
 * @returns A Promise that resolves to the created quiz data.
 */
export const createQuiz = createServerFn(
    "POST",
    async (request: CreateQuizRequest): Promise<CreateQuizResponse> => {
        console.info("Creating new quiz with questions...", request);

        try {
            return await db.transaction(async (tx) => {
                // 1. Create the quiz
                const [newQuiz] = await tx
                    .insert(QuizTable)
                    .values(request.quiz)
                    .returning();
                console.log("[new quiz] ==>", newQuiz);

                // 2. Create questions with quiz ID
                const questionsWithQuizId = request.questions.map(
                    (question) => ({
                        ...question,
                        quizId: newQuiz.id,
                    }),
                );
                const questions = await tx
                    .insert(QuestionTable)
                    .values(questionsWithQuizId)
                    .returning();
                console.log("[questions] ==>", questions);

                // 3. Create multiple choice options with question IDs
                if (request.multipleChoiceOptions.length > 0) {
                    const optionsWithQuestionIds =
                        request.multipleChoiceOptions.map((option, index) => ({
                            ...option,
                            questionId: questions[Math.floor(index / 4)].id, // Assuming 4 options per question
                        }));
                    const options = await tx
                        .insert(MultipleChoiceOptionTable)
                        .values(optionsWithQuestionIds)
                        .returning();
                    console.log("[options] ==>", options);
                }

                return newQuiz;
            });
        } catch (error) {
            console.error("Error creating quiz:", error);
            throw new Error("Failed to create quiz and associated data");
        }
    },
);

/**
 * Deletes a quiz by its ID.
 * @param quizId - The ID of the quiz to delete.
 * @returns A Promise that resolves to the deleted quiz data.
 */
export const deleteQuiz = createServerFn("POST", async (quizId: number) => {
    console.info(`Deleting quiz with id ${quizId}...`);

    try {
        const [deletedQuiz] = await db
            .delete(QuizTable)
            .where(eq(QuizTable.id, quizId))
            .returning();

        if (!deletedQuiz) {
            throw new Error("Quiz not found");
        }

        console.log("[deleted quiz] ==>", deletedQuiz);
        return deletedQuiz;
    } catch (error) {
        console.error("Error deleting quiz:", error);
        throw new Error("Failed to delete quiz");
    }
});
