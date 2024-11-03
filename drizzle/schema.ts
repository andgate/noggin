import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

/**
 * Sources Table
 */
export const sources = sqliteTable("sources", {
    id: integer("id").primaryKey(),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    content: text("content").notNull(),
    quizId: integer("quiz_id")
        .references(() => quizzes.id)
        .notNull(),
});

// Zod Schemas
export const insertSourceSchema = createInsertSchema(sources);
export const selectSourceSchema = createSelectSchema(sources);

// Source Relations
export const sourcesRelations = relations(sources, ({ one }) => ({
    quiz: one(quizzes, {
        fields: [sources.quizId],
        references: [quizzes.id],
    }),
}));

/**
 * Questions Table
 */
export const questions = sqliteTable("questions", {
    id: integer("id").primaryKey(),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    quizId: integer("quiz_id")
        .references(() => quizzes.id)
        .notNull(),
    questionType: text("question_type").notNull(), // "multiple_choice" or "written"
    question: text("question").notNull(),
});

// Zod Schemas
export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);

export type SelectQuestion = z.infer<typeof selectQuestionSchema>;

// Question Relations
export const questionsRelations = relations(questions, ({ one, many }) => ({
    quiz: one(quizzes, {
        fields: [questions.quizId],
        references: [quizzes.id],
    }),
    choices: many(multipleChoiceOptions),
}));

/**
 * Multiple Choice Options Table
 */
export const multipleChoiceOptions = sqliteTable("multiple_choice_options", {
    id: integer("id").primaryKey(),
    createdAt: text("created_at")
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    questionId: integer("question_id")
        .references(() => questions.id)
        .notNull(),
    optionText: text("option_text").notNull(),
    isCorrect: integer("is_correct").notNull(), // SQLite doesn't have boolean, so we use integer (0/1)
});

// Zod Schemas
export const insertMultipleChoiceOptionSchema = createInsertSchema(
    multipleChoiceOptions,
);
export const selectMultipleChoiceOptionSchema = createSelectSchema(
    multipleChoiceOptions,
);

// Multiple Choice Option Relations
export const multipleChoiceOptionsRelations = relations(
    multipleChoiceOptions,
    ({ one }) => ({
        question: one(questions, {
            fields: [multipleChoiceOptions.questionId],
            references: [questions.id],
        }),
    }),
);

/**
 * Quiz Table
 */
export const quizzes = sqliteTable("quizzes", {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
});

// Zod Schemas
export const insertQuizSchema = createInsertSchema(quizzes);
export const selectQuizSchema = createSelectSchema(quizzes);

// Quiz Relations
export const quizzesRelations = relations(quizzes, ({ many }) => ({
    sources: many(sources),
    questions: many(questions),
}));
