import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import db from "drizzle/db";
import { NewQuiz, Quiz, quizzes } from "drizzle/schema";

/**
 * Fetches a single quiz by its ID.
 * @param quizId - The ID of the quiz to fetch.
 * @returns A Promise that resolves to the quiz data.
 */
export const fetchQuiz = createServerFn("GET", async (quizId: number) => {
    console.info(`Fetching quiz with id ${quizId}...`);

    try {
        const quiz = db
            .select()
            .from(quizzes)
            .where(eq(quizzes.id, quizId))
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
});

/**
 * Fetches all quizzes.
 * @returns A Promise that resolves to an array of quiz data.
 */
export const fetchQuizzes = createServerFn<"GET", undefined, Quiz[]>(
    "GET",
    async () => {
        console.info("Fetching quizzes...");

        try {
            const allQuizzes = db.select().from(quizzes).all();
            console.log("[quizzes] ==>", allQuizzes);
            return allQuizzes || [];
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            return [];
        }
    },
);

/**
 * Creates a new quiz.
 * @param quizData - The data for the new quiz.
 * @returns A Promise that resolves to the created quiz data.
 */
export const createQuiz = createServerFn("POST", async (quizData: NewQuiz) => {
    console.info("Creating new quiz...");

    try {
        const [newQuiz] = await db.insert(quizzes).values(quizData).returning();
        console.log("[new quiz] ==>", newQuiz);
        return newQuiz;
    } catch (error) {
        console.error("Error creating quiz:", error);
        throw new Error("Failed to create quiz");
    }
});
