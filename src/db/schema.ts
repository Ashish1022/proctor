import { pgTable, text, timestamp, uniqueIndex, uuid, integer, json, boolean } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userRoles = pgEnum('user_roles', ['student', 'admin']);
export const userYear = pgEnum('user_year', ['BE', 'SE', 'TE']);
export const questionTypes = pgEnum('question_types', ['multiple_choice', 'multiple_select']);
export const testStatus = pgEnum('test_status', ['draft', 'published', 'archived']);
export const submissionStatus = pgEnum('submission_status', ['in_progress', 'submitted', 'graded']);

export const users = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),

    firstname: text("firstname").notNull(),
    lastname: text("lastname").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    year: userYear("year").notNull(),
    role: userRoles("role").default('student').notNull(),
    password: text("password").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => [
    uniqueIndex("email_idx").on(t.email),
    uniqueIndex("phone_idx").on(t.phone)
]);

export const tests = pgTable("tests", {
    id: uuid().primaryKey().defaultRandom(),

    title: text("title").notNull(),
    description: text("description"),
    instructions: text("instructions"),

    duration: integer("duration").notNull(),
    totalMarks: integer("total_marks").notNull(),

    startTime: timestamp("start_time"),
    endTime: timestamp("end_time"),

    status: testStatus("status").default('draft').notNull(),

    targetYears: json("target_years").$type<('BE' | 'SE' | 'TE')[]>().notNull().default([]),

    createdBy: uuid("created_by").notNull().references(() => users.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const questions = pgTable("questions", {
    id: uuid().primaryKey().defaultRandom(),

    testId: uuid("test_id").notNull().references(() => tests.id, { onDelete: 'cascade' }),

    questionText: text("question_text").notNull(),
    questionType: questionTypes("question_type").notNull(),

    options: json("options").$type<string[]>().notNull(),

    correctAnswers: json("correct_answers").$type<number[]>().notNull(),

    marks: integer("marks").notNull().default(1),
    order: integer("order").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const submissions = pgTable("submissions", {
    id: uuid().primaryKey().defaultRandom(),

    testId: uuid("test_id").notNull().references(() => tests.id),
    studentId: uuid("student_id").notNull().references(() => users.id),

    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),

    status: submissionStatus("status").default('in_progress').notNull(),

    totalScore: integer("total_score").default(0),
    obtainedScore: integer("obtained_score").default(0),
    percentage: integer("percentage").default(0),

    timeSpent: integer("time_spent").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => [
    uniqueIndex("unique_student_test").on(t.studentId, t.testId)
]);

export const answers = pgTable("answers", {
    id: uuid().primaryKey().defaultRandom(),

    submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: 'cascade' }),
    questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: 'cascade' }),

    selectedAnswers: json("selected_answers").$type<number[]>().notNull().default([]),

    isCorrect: boolean("is_correct").default(false),
    marksObtained: integer("marks_obtained").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (t) => [
    uniqueIndex("unique_submission_question").on(t.submissionId, t.questionId)
]);

export const usersRelations = relations(users, ({ many }) => ({
    createdTests: many(tests),
    submissions: many(submissions)
}));

export const testsRelations = relations(tests, ({ one, many }) => ({
    creator: one(users, {
        fields: [tests.createdBy],
        references: [users.id]
    }),
    questions: many(questions),
    submissions: many(submissions)
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
    test: one(tests, {
        fields: [questions.testId],
        references: [tests.id]
    }),
    answers: many(answers)
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
    test: one(tests, {
        fields: [submissions.testId],
        references: [tests.id]
    }),
    student: one(users, {
        fields: [submissions.studentId],
        references: [users.id]
    }),
    answers: many(answers)
}));

export const answersRelations = relations(answers, ({ one }) => ({
    submission: one(submissions, {
        fields: [answers.submissionId],
        references: [submissions.id]
    }),
    question: one(questions, {
        fields: [answers.questionId],
        references: [questions.id]
    })
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Test = typeof tests.$inferSelect;
export type NewTest = typeof tests.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;