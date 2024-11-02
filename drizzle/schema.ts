import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const quizzes = sqliteTable("quizzes", {
    id: integer("id").primaryKey(),
    title: text("title"),
    questionCount: integer("question_count"),
    dateCreated: text("date_created"),
    status: text("status"), // Completed, In Progress, Draft
    source: text("source"), // Text source of the quiz
});

// Add type definitions
export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;
