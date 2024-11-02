import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const QuizTable = sqliteTable("quizzes", {
    id: integer("id").primaryKey(),
    title: text("title"),
    questionCount: integer("question_count"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    status: text("status"), // Completed, In Progress, Draft
    source: text("source"), // Text source of the quiz
});

// Add type definitions
export type Quiz = typeof QuizTable.$inferSelect;
export type NewQuiz = typeof QuizTable.$inferInsert;
export type DeleteQuiz = Pick<Quiz, "id">;
