import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import db from "drizzle/db";
import * as schema from "drizzle/schema";
import { GeneratedQuiz } from "~/types/quiz-generation-types";
import { Quiz, QuizId } from "~/types/quiz-view-types";

/**
 * Fetches a single quiz by its ID.
 * @param quizId - The ID of the quiz to fetch.
 * @returns A Promise that resolves to the quiz data.
 */
export const getQuiz = createServerFn(
    "GET",
    async (quizId: QuizId): Promise<Quiz> => {
        console.info(`Fetching quiz with id ${quizId}...`);

        try {
            const quiz = await db.query.quizzes.findFirst({
                where: eq(schema.quizzes.id, quizId),
                with: {
                    sources: true,
                    questions: {
                        with: {
                            choices: true,
                        },
                    },
                },
            });

            if (!quiz) {
                throw new Error("Quiz not found");
            }

            return quiz as unknown as Quiz;
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
export const getAllQuizzes = createServerFn<"GET", undefined, Quiz[]>(
    "GET",
    async (): Promise<Quiz[]> => {
        console.info("Fetching quizzes...");

        try {
            const allQuizzes = await db.query.quizzes.findMany({
                with: {
                    sources: true,
                    questions: {
                        with: {
                            choices: true,
                        },
                    },
                },
            });
            return allQuizzes as unknown as Quiz[];
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            return [];
        }
    },
);

/**
 * Creates a new quiz.
 * @param generatedQuiz - The generated quiz data.
 * @returns A Promise that resolves to the created quiz data.
 */
export const createQuiz = createServerFn(
    "POST",
    async (generatedQuiz: GeneratedQuiz): Promise<QuizId> => {
        console.info("Storing generated quiz in database...", generatedQuiz);

        try {
            return await db.transaction(async (tx) => {
                const { title } = generatedQuiz;
                // 1. Create the new quiz
                const [newQuiz] = await tx
                    .insert(schema.quizzes)
                    .values({ title })
                    .returning();

                // 2. Create questions with quiz ID
                for (const question of generatedQuiz.questions) {
                    const [newQuestion] = await tx
                        .insert(schema.questions)
                        .values({
                            quizId: newQuiz.id,
                            questionType: question.questionType,
                            question: question.question,
                        })
                        .returning();

                    // 3. Create multiple choice options with question IDs
                    if (question.questionType === "multiple_choice") {
                        for (const choice of question.choices) {
                            await tx
                                .insert(schema.multipleChoiceOptions)
                                .values({
                                    questionId: newQuestion.id,
                                    optionText: choice.text,
                                    isCorrect: choice.isCorrect ? 1 : 0,
                                })
                                .returning();
                        }
                    }
                }

                return newQuiz.id;
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
            .delete(schema.quizzes)
            .where(eq(schema.quizzes.id, quizId))
            .returning();

        if (!deletedQuiz) {
            throw new Error("Quiz not found");
        }

        return deletedQuiz;
    } catch (error) {
        console.error("Error deleting quiz:", error);
        throw new Error("Failed to delete quiz");
    }
});
