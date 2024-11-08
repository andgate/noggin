import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

/**
 * Sources Table
 */
export const sources = sqliteTable('sources', {
    id: integer('id').primaryKey(),
    createdAt: text('created_at')
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    content: text('content').notNull(),
    quizId: integer('quiz_id')
        .references(() => quizzes.id, { onDelete: 'cascade' })
        .notNull(),
})

// Zod Schemas
export const insertSourceSchema = createInsertSchema(sources)
export const selectSourceSchema = createSelectSchema(sources)

// Source Relations
export const sourcesRelations = relations(sources, ({ one }) => ({
    quiz: one(quizzes, {
        fields: [sources.quizId],
        references: [quizzes.id],
    }),
}))

/**
 * Questions Table
 */
export const questions = sqliteTable('questions', {
    id: integer('id').primaryKey(),
    createdAt: text('created_at')
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    quizId: integer('quiz_id')
        .references(() => quizzes.id, { onDelete: 'cascade' })
        .notNull(),
    questionType: text('question_type').notNull(), // "multiple_choice" or "written"
    question: text('question').notNull(),
})

// Zod Schemas
export const insertQuestionSchema = createInsertSchema(questions)
export const selectQuestionSchema = createSelectSchema(questions)

export type SelectQuestion = z.infer<typeof selectQuestionSchema>

// Question Relations
export const questionsRelations = relations(questions, ({ one, many }) => ({
    quiz: one(quizzes, {
        fields: [questions.quizId],
        references: [quizzes.id],
    }),
    choices: many(multipleChoiceOptions),
    responses: many(responses),
}))

/**
 * Multiple Choice Options Table
 */
export const multipleChoiceOptions = sqliteTable('multiple_choice_options', {
    id: integer('id').primaryKey(),
    createdAt: text('created_at')
        .default(sql`(CURRENT_TIMESTAMP)`)
        .notNull(),
    questionId: integer('question_id')
        .references(() => questions.id, { onDelete: 'cascade' })
        .notNull(),
    optionText: text('option_text').notNull(),
    isCorrect: integer('is_correct').notNull(), // SQLite doesn't have boolean, so we use integer (0/1)
})

// Zod Schemas
export const insertMultipleChoiceOptionSchema = createInsertSchema(multipleChoiceOptions)
export const selectMultipleChoiceOptionSchema = createSelectSchema(multipleChoiceOptions)

// Multiple Choice Option Relations
export const multipleChoiceOptionsRelations = relations(multipleChoiceOptions, ({ one }) => ({
    question: one(questions, {
        fields: [multipleChoiceOptions.questionId],
        references: [questions.id],
    }),
}))

/**
 * Quiz Table
 */

// TODO: Add indexes for frequently queried fields
// TODO: Implement versioning for quiz content
// TODO: Add audit logging for schema changes
// TODO: Consider adding user management tables
export const quizzes = sqliteTable('quizzes', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    createdAt: text('created_at')
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    // Time limit in minutes
    timeLimit: integer('time_limit').notNull(),
})

// Zod Schemas
export const insertQuizSchema = createInsertSchema(quizzes)
export const selectQuizSchema = createSelectSchema(quizzes)

// Quiz Relations
export const quizzesRelations = relations(quizzes, ({ many }) => ({
    sources: many(sources),
    questions: many(questions),
    submissions: many(submissions),
}))

/** Submissions Table */
export const submissions = sqliteTable('submissions', {
    id: integer('id').primaryKey(),
    quizId: integer('quiz_id')
        .references(() => quizzes.id, { onDelete: 'cascade' })
        .notNull(),
    completedAt: text('completed_at')
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    // Time limit in minutes
    timeLimit: integer('time_limit').notNull(),
    // Time elapsed in milliseconds
    timeElapsed: integer('time_elapsed').notNull(),
    // Grade between 0 and 100.
    grade: integer('grade').notNull(),
    letterGrade: text('letter_grade').notNull(),
})

// Zod Schemas
export const insertSubmissionSchema = createInsertSchema(submissions)
export const selectSubmissionSchema = createSelectSchema(submissions)

// Submission Relations
export const submissionsRelations = relations(submissions, ({ one, many }) => ({
    quiz: one(quizzes, {
        fields: [submissions.quizId],
        references: [quizzes.id],
    }),
    responses: many(responses),
}))

/** Responses Table */
export const responses = sqliteTable('responses', {
    id: integer('id').primaryKey(),
    createdAt: text('created_at')
        .notNull()
        .default(sql`(CURRENT_TIMESTAMP)`),
    submissionId: integer('submission_id')
        .references(() => submissions.id, { onDelete: 'cascade' })
        .notNull(),
    questionId: integer('question_id')
        .references(() => questions.id, { onDelete: 'cascade' })
        .notNull(),
    correctAnswer: text('correct_answer').notNull(),
    verdict: text('verdict').notNull(),
    feedback: text('feedback').notNull(),
})

// Zod Schemas
export const insertResponseSchema = createInsertSchema(responses)
export const selectResponseSchema = createSelectSchema(responses)

// Response Relations
export const responsesRelations = relations(responses, ({ one }) => ({
    submission: one(submissions, {
        fields: [responses.submissionId],
        references: [submissions.id],
    }),
    question: one(questions, {
        fields: [responses.questionId],
        references: [questions.id],
    }),
}))
