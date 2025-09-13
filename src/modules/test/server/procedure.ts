import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { createTestSchema, updateTestSchema } from "../schema";
import { questions, submissions, tests, users } from "@/db/schema";
import z from "zod";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const testRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createTestSchema)
        .mutation(async ({ ctx, input }) => {

            const totalMarks = input.questions.reduce((sum, q) => sum + q.marks, 0);

            const newTest = await ctx.db
                .insert(tests)
                .values({
                    title: input.title,
                    description: input.description,
                    instructions: input.instructions,
                    duration: input.duration,
                    totalMarks,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    status: 'draft',
                    createdBy: ctx.user.id,
                    targetYears: input.targetYears
                })
                .returning({ id: tests.id });

            const testId = newTest[0].id;

            const questionsToInsert = input.questions.map(q => ({
                testId,
                questionText: q.questionText,
                questionType: q.questionType,
                options: q.options,
                correctAnswers: q.correctAnswers,
                marks: q.marks,
                order: q.order,
            }));

            await ctx.db.insert(questions).values(questionsToInsert);

            return {
                success: true,
                testId,
                message: 'Test created successfully'
            };
        }),

    getAll: protectedProcedure.query(async ({ ctx }) => {

        const allTests = await ctx.db
            .select({
                id: tests.id,
                title: tests.title,
                description: tests.description,
                duration: tests.duration,
                totalMarks: tests.totalMarks,
                status: tests.status,
                createdAt: tests.createdAt,
                startTime: tests.startTime,
                endTime: tests.endTime,
            })
            .from(tests)
            .where(eq(tests.createdBy, ctx.user.id))
            .orderBy(tests.createdAt);

        return allTests;
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {

            const test = await ctx.db
                .select()
                .from(tests)
                .where(eq(tests.id, input.id))
                .limit(1);

            if (test.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Test not found'
                });
            }

            if (test[0].createdBy !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                });
            }

            const testQuestions = await ctx.db
                .select()
                .from(questions)
                .where(eq(questions.testId, input.id))
                .orderBy(questions.order);

            return {
                ...test[0],
                questions: testQuestions
            };
        }),

    update: protectedProcedure
        .input(updateTestSchema)
        .mutation(async ({ ctx, input }) => {

            const existingTest = await ctx.db
                .select()
                .from(tests)
                .where(eq(tests.id, input.id))
                .limit(1);

            if (existingTest.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Test not found'
                });
            }

            if (existingTest[0].createdBy !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                });
            }

            await ctx.db
                .update(tests)
                .set({
                    title: input.title,
                    description: input.description,
                    instructions: input.instructions,
                    duration: input.duration,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    status: input.status,
                    updatedAt: new Date(),
                })
                .where(eq(tests.id, input.id));

            return {
                success: true,
                message: 'Test updated successfully'
            };
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const existingTest = await ctx.db
                .select()
                .from(tests)
                .where(eq(tests.id, input.id))
                .limit(1);

            if (existingTest.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Test not found'
                });
            }

            if (existingTest[0].createdBy !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                });
            }

            await ctx.db
                .delete(tests)
                .where(eq(tests.id, input.id));

            return {
                success: true,
                message: 'Test deleted successfully'
            };
        }),

    publish: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {

            const existingTest = await ctx.db
                .select()
                .from(tests)
                .where(eq(tests.id, input.id))
                .limit(1);

            if (existingTest.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Test not found'
                });
            }

            if (existingTest[0].createdBy !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Access denied'
                });
            }

            const questionCount = await ctx.db
                .select()
                .from(questions)
                .where(eq(questions.testId, input.id));

            if (questionCount.length === 0) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Cannot publish test without questions'
                });
            }

            await ctx.db
                .update(tests)
                .set({
                    status: 'published',
                    updatedAt: new Date(),
                })
                .where(eq(tests.id, input.id));

            return {
                success: true,
                message: 'Test published successfully'
            };
        }),

    getTestByYear: baseProcedure
        .input(z.object({ year: z.string(), userId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                if (!input.year) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Year is required'
                    });
                }

                if (!input.userId) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'User ID is required'
                    });
                }

                // First, verify the user exists and get their year
                const user = await ctx.db
                    .select({
                        id: users.id,
                        year: users.year,
                        role: users.role
                    })
                    .from(users)
                    .where(eq(users.id, input.userId))
                    .limit(1);

                if (!user.length) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'User not found'
                    });
                }

                // Validate that the requested year matches the user's year (security check)
                if (user[0].year !== input.year) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Access denied: Year mismatch'
                    });
                }

                // Get all published tests for the user's year
                const availableTests = await ctx.db
                    .select({
                        id: tests.id,
                        title: tests.title,
                        description: tests.description,
                        instructions: tests.instructions,
                        duration: tests.duration,
                        totalMarks: tests.totalMarks,
                        startTime: tests.startTime,
                        endTime: tests.endTime,
                        status: tests.status,
                        targetYears: tests.targetYears,
                        createdAt: tests.createdAt,
                    })
                    .from(tests)
                    .where(
                        and(
                            eq(tests.status, 'published'),
                            // Fixed: Better way to check if year exists in targetYears JSON array
                            sql`${tests.targetYears}::jsonb ? ${input.year}`
                        )
                    )
                    .orderBy(desc(tests.createdAt)); // Changed to desc for newest first

                if (!availableTests.length) {
                    return {
                        tests: [],
                        availableTests: [],
                        submittedTests: [],
                        totalTests: 0,
                    };
                }

                const testIds = availableTests.map(test => test.id);

                // Get user's submissions for these tests
                const userSubmissions = await ctx.db
                    .select({
                        id: submissions.id,
                        testId: submissions.testId,
                        status: submissions.status,
                        startedAt: submissions.startedAt,
                        submittedAt: submissions.submittedAt,
                        totalScore: submissions.totalScore,
                        obtainedScore: submissions.obtainedScore,
                        percentage: submissions.percentage,
                        timeSpent: submissions.timeSpent,
                    })
                    .from(submissions)
                    .where(
                        and(
                            eq(submissions.studentId, input.userId),
                            inArray(submissions.testId, testIds) // Fixed: Use inArray instead of sql template
                        )
                    );

                // Get question counts for each test
                const questionCounts = await ctx.db
                    .select({
                        testId: questions.testId,
                        count: sql<number>`cast(count(*) as int)`.as('count')
                    })
                    .from(questions)
                    .where(inArray(questions.testId, testIds)) // Fixed: Use inArray
                    .groupBy(questions.testId);

                // Combine all data
                const testsWithSubmissions = availableTests.map(test => {
                    const userSubmission = userSubmissions.find(sub => sub.testId === test.id);
                    const questionCount = questionCounts.find(qc => qc.testId === test.id)?.count || 0;

                    return {
                        ...test,
                        questionCount,
                        userSubmission: userSubmission || null,
                        // Add computed fields for easier frontend consumption
                        isCompleted: userSubmission?.status === 'submitted' || userSubmission?.status === 'graded',
                        isInProgress: userSubmission?.status === 'in_progress',
                        canTake: !userSubmission || userSubmission.status === 'in_progress',
                        // Format dates for frontend
                        formattedStartTime: test.startTime ? test.startTime.toISOString() : null,
                        formattedEndTime: test.endTime ? test.endTime.toISOString() : null,
                    };
                });

                // Filter tests based on current time and submission status
                const now = new Date();

                const availableForTaking = testsWithSubmissions.filter(test => {
                    // Check if test is within time bounds
                    const isWithinTimeRange = (!test.startTime || test.startTime <= now) &&
                        (!test.endTime || test.endTime >= now);

                    // Check if user can take the test
                    const canTake = !test.userSubmission || test.userSubmission.status === 'in_progress';

                    return isWithinTimeRange && canTake;
                });

                const submittedTests = testsWithSubmissions.filter(test =>
                    test.userSubmission &&
                    (test.userSubmission.status === 'submitted' || test.userSubmission.status === 'graded')
                );

                // Also include in-progress tests in a separate category if needed
                const inProgressTests = testsWithSubmissions.filter(test =>
                    test.userSubmission?.status === 'in_progress'
                );

                return {
                    tests: testsWithSubmissions,
                    availableTests: availableForTaking,
                    submittedTests: submittedTests,
                    inProgressTests: inProgressTests,
                    totalTests: testsWithSubmissions.length,
                    user: {
                        id: user[0].id,
                        year: user[0].year,
                        role: user[0].role
                    }
                };

            } catch (error) {
                console.error("Error fetching tests by year:", error);

                // Re-throw TRPC errors
                if (error instanceof TRPCError) {
                    throw error;
                }

                // Handle other errors
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch tests'
                });
            }
        })
});