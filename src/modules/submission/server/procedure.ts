import { db } from "@/db";
import { answers, questions, submissions, tests, users } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const submissionRouter = createTRPCRouter({
    submit: baseProcedure
        .input(z.object({
            testId: z.string(),
            studentId: z.string(),
            answers: z.record(z.string(), z.any()),
            timeSpent: z.number(),
            flaggedQuestions: z.array(z.string()).optional(),
            forced: z.boolean().default(false)
        }))
        .mutation(async ({ input }) => {
            const { testId, studentId, answers: submittedAnswers, timeSpent, forced } = input;

            // Get test and questions
            const test = await db.select().from(tests)
                .where(eq(tests.id, testId))
                .limit(1);

            if (!test.length) {
                throw new Error('Test not found');
            }

            const testQuestions = await db.select().from(questions)
                .where(eq(questions.testId, testId));

            // Check if submission already exists
            const existingSubmission = await db.select().from(submissions)
                .where(and(
                    eq(submissions.testId, testId),
                    eq(submissions.studentId, studentId)
                ))
                .limit(1);

            let submissionId: string;

            if (existingSubmission.length) {
                submissionId = existingSubmission[0].id;

                // Update existing submission
                await db.update(submissions)
                    .set({
                        submittedAt: new Date(),
                        status: 'submitted',
                        timeSpent,
                        updatedAt: new Date()
                    })
                    .where(eq(submissions.id, submissionId));
            } else {
                // Create new submission
                const newSubmission = await db.insert(submissions)
                    .values({
                        testId,
                        studentId,
                        startedAt: new Date(),
                        submittedAt: new Date(),
                        status: 'submitted',
                        timeSpent,
                        totalScore: test[0].totalMarks,
                        obtainedScore: 0, // Will be calculated
                        percentage: 0 // Will be calculated
                    })
                    .returning();

                submissionId = newSubmission[0].id;
            }

            // Calculate score and save answers
            let totalObtained = 0;

            for (const question of testQuestions) {
                const studentAnswer = submittedAnswers[question.id];

                // Convert student answer to array of indices for comparison
                let selectedAnswers: number[] = [];

                if (studentAnswer !== undefined && studentAnswer !== null) {
                    if (question.questionType === 'multiple_choice') {
                        // For multiple choice, find the index of the selected option
                        const selectedIndex = question.options?.indexOf(studentAnswer);
                        if (selectedIndex !== undefined && selectedIndex !== -1) {
                            selectedAnswers = [selectedIndex];
                        }
                    } else if (question.questionType === 'multiple_select') {
                        // For multiple select, find indices of all selected options
                        if (Array.isArray(studentAnswer)) {
                            selectedAnswers = studentAnswer
                                .map(answer => question.options?.indexOf(answer))
                                .filter(index => index !== undefined && index !== -1) as number[];
                        }
                    }
                }

                // Check if answer is correct
                const isCorrect = arraysEqual(selectedAnswers.sort(), question.correctAnswers.sort());
                const marksObtained = isCorrect ? question.marks : 0;
                totalObtained += marksObtained;

                // Save/update answer
                const existingAnswer = await db.select().from(answers)
                    .where(and(
                        eq(answers.submissionId, submissionId),
                        eq(answers.questionId, question.id)
                    ))
                    .limit(1);

                if (existingAnswer.length) {
                    await db.update(answers)
                        .set({
                            selectedAnswers,
                            isCorrect,
                            marksObtained,
                            updatedAt: new Date()
                        })
                        .where(eq(answers.id, existingAnswer[0].id));
                } else {
                    await db.insert(answers)
                        .values({
                            submissionId,
                            questionId: question.id,
                            selectedAnswers,
                            isCorrect,
                            marksObtained
                        });
                }
            }

            // Update submission with final scores
            const percentage = Math.round((totalObtained / test[0].totalMarks) * 100);

            await db.update(submissions)
                .set({
                    obtainedScore: totalObtained,
                    percentage,
                    updatedAt: new Date()
                })
                .where(eq(submissions.id, submissionId));

            return {
                submissionId,
                obtainedScore: totalObtained,
                totalScore: test[0].totalMarks,
                percentage,
                message: 'Test submitted successfully'
            };
        }),

    getSubmission: baseProcedure
        .input(z.object({
            testId: z.string(),
            studentId: z.string()
        }))
        .query(async ({ input }) => {
            const submission = await db.select().from(submissions)
                .where(and(
                    eq(submissions.testId, input.testId),
                    eq(submissions.studentId, input.studentId)
                ))
                .limit(1);

            if (!submission.length) {
                return null;
            }

            const submissionAnswers = await db.select().from(answers)
                .where(eq(answers.submissionId, submission[0].id));

            return {
                ...submission[0],
                answers: submissionAnswers
            };
        }),

    startTest: baseProcedure
        .input(z.object({
            testId: z.string(),
            studentId: z.string()
        }))
        .mutation(async ({ input }) => {
            const { testId, studentId } = input;

            // Check if submission already exists
            const existingSubmission = await db.select().from(submissions)
                .where(and(
                    eq(submissions.testId, testId),
                    eq(submissions.studentId, studentId)
                ))
                .limit(1);

            if (existingSubmission.length) {
                return existingSubmission[0];
            }

            // Get test total marks
            const test = await db.select().from(tests)
                .where(eq(tests.id, testId))
                .limit(1);

            if (!test.length) {
                throw new Error('Test not found');
            }

            // Create new submission
            const newSubmission = await db.insert(submissions)
                .values({
                    testId,
                    studentId,
                    startedAt: new Date(),
                    status: 'in_progress',
                    totalScore: test[0].totalMarks
                })
                .returning();

            return newSubmission[0];
        }),

    getResults: baseProcedure
        .input(z.object({
            testId: z.string(),
            studentId: z.string()
        }))
        .query(async ({ input }) => {
            const { testId, studentId } = input;

            const submission = await db.select().from(submissions)
                .where(and(
                    eq(submissions.testId, testId),
                    eq(submissions.studentId, studentId)
                ))
                .limit(1);

            if (!submission.length) {
                throw new Error('Submission not found');
            }

            const submissionData = submission[0];

            // Get test data
            const test = await db.select().from(tests)
                .where(eq(tests.id, testId))
                .limit(1);

            if (!test.length) {
                throw new Error('Test not found');
            }

            const testData = test[0];

            // Get questions
            const testQuestions = await db.select().from(questions)
                .where(eq(questions.testId, testId))
                .orderBy(questions.order);

            // Get answers
            const submissionAnswers = await db.select().from(answers)
                .where(eq(answers.submissionId, submissionData.id));

            // Get student data
            const student = await db.select().from(users)
                .where(eq(users.id, studentId))
                .limit(1);

            if (!student.length) {
                throw new Error('Student not found');
            }

            // Transform answers into results format
            const questionResults = testQuestions.map(question => {
                const answer = submissionAnswers.find(a => a.questionId === question.id);

                let studentAnswer: any = null;
                let correctAnswer: any = null;

                // Convert indices back to actual option values for display
                if (answer && answer.selectedAnswers.length > 0) {
                    if (question.questionType === 'multiple_choice') {
                        const selectedIndex = answer.selectedAnswers[0];
                        studentAnswer = question.options?.[selectedIndex] || null;
                    } else if (question.questionType === 'multiple_select') {
                        studentAnswer = answer.selectedAnswers
                            .map(index => question.options?.[index])
                            .filter(Boolean);
                    }
                }

                // Convert correct answers for display
                if (question.correctAnswers.length > 0) {
                    if (question.questionType === 'multiple_choice') {
                        const correctIndex = question.correctAnswers[0];
                        correctAnswer = question.options?.[correctIndex] || null;
                    } else if (question.questionType === 'multiple_select') {
                        correctAnswer = question.correctAnswers
                            .map(index => question.options?.[index])
                            .filter(Boolean);
                    }
                }

                return {
                    questionId: question.id,
                    question: question.questionText,
                    type: question.questionType,
                    studentAnswer,
                    correctAnswer,
                    isCorrect: answer?.isCorrect || false,
                    points: answer?.marksObtained || 0,
                    maxPoints: question.marks,
                    feedback: generateFeedback(question, answer?.isCorrect || false)
                };
            });

            return {
                id: submissionData.id,
                testId: testData.id,
                testTitle: testData.title,
                studentId: student[0].id,
                studentName: `${student[0].firstname} ${student[0].lastname}`,
                score: submissionData.obtainedScore || 0,
                totalPoints: submissionData.totalScore || 0,
                percentage: submissionData.percentage || 0,
                timeSpent: submissionData.timeSpent || 0,
                submittedAt: submissionData.submittedAt?.toISOString() || new Date().toISOString(),
                status: submissionData.status,
                questionResults,
                violations: [] // You can add violation tracking later
            };
        }),
    getAnalytics: baseProcedure
        .input(z.object({
            testId: z.string()
        }))
        .query(async ({ input }) => {
            const { testId } = input;

            // Get test data
            const test = await db.select().from(tests)
                .where(eq(tests.id, testId))
                .limit(1);

            if (!test.length) {
                throw new Error('Test not found');
            }

            const testData = test[0];

            // Get all submissions for this test
            const testSubmissions = await db.select({
                submission: submissions,
                student: {
                    id: users.id,
                    firstname: users.firstname,
                    lastname: users.lastname,
                    email: users.email
                }
            })
                .from(submissions)
                .innerJoin(users, eq(submissions.studentId, users.id))
                .where(eq(submissions.testId, testId));

            // Get all questions for this test
            const testQuestions = await db.select().from(questions)
                .where(eq(questions.testId, testId))
                .orderBy(questions.order);

            // Get all answers for analysis
            const allAnswers = await db.select({
                answer: answers,
                question: questions,
                submission: submissions
            })
                .from(answers)
                .innerJoin(questions, eq(answers.questionId, questions.id))
                .innerJoin(submissions, eq(answers.submissionId, submissions.id))
                .where(eq(submissions.testId, testId));

            // Calculate analytics
            const totalStudents = testSubmissions.length;
            const completedSubmissions = testSubmissions.filter(s => s.submission.status === 'submitted');

            // Calculate scores
            const scores = completedSubmissions.map(s => s.submission.percentage || 0);
            const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
            const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
            const passRate = scores.length > 0 ? (scores.filter(score => score >= 60).length / scores.length) * 100 : 0;

            // Student rankings
            const studentRankings = completedSubmissions
                .map(s => ({
                    studentId: s.student.id,
                    name: `${s.student.firstname} ${s.student.lastname}`,
                    email: s.student.email,
                    score: s.submission.percentage || 0,
                    obtainedScore: s.submission.obtainedScore || 0,
                    totalScore: s.submission.totalScore || 0,
                    timeSpent: s.submission.timeSpent || 0,
                    submittedAt: s.submission.submittedAt,
                }))
                .sort((a, b) => b.score - a.score)
                .map((student, index) => ({ ...student, rank: index + 1 }));

            // Score distribution
            const scoreRanges = [
                { range: '90-100%', min: 90, max: 100, count: 0, color: '#10B981' },
                { range: '80-89%', min: 80, max: 89, count: 0, color: '#624CF5' },
                { range: '70-79%', min: 70, max: 79, count: 0, color: '#F59E0B' },
                { range: '60-69%', min: 60, max: 69, count: 0, color: '#EF4444' },
                { range: 'Below 60%', min: 0, max: 59, count: 0, color: '#6B7280' }
            ];

            scores.forEach(score => {
                const range = scoreRanges.find(r => score >= r.min && score <= r.max);
                if (range) range.count++;
            });

            // Question analysis
            const questionAnalysis = testQuestions.map(question => {
                const questionAnswers = allAnswers.filter(a => a.question.id === question.id);
                const correctAnswers = questionAnswers.filter(a => a.answer.isCorrect).length;
                const incorrectAnswers = questionAnswers.filter(a => !a.answer.isCorrect).length;

                // Determine difficulty based on success rate
                const successRate = questionAnswers.length > 0 ? correctAnswers / questionAnswers.length : 0;
                let difficulty = 'Medium';
                if (successRate >= 0.8) difficulty = 'Easy';
                else if (successRate <= 0.5) difficulty = 'Hard';

                return {
                    questionId: question.id,
                    questionText: question.questionText,
                    questionNumber: `Q${question.order}`,
                    correct: correctAnswers,
                    incorrect: incorrectAnswers,
                    difficulty,
                    successRate: Math.round(successRate * 100),
                    totalAttempts: questionAnswers.length
                };
            });

            return {
                testDetails: {
                    id: testData.id,
                    title: testData.title,
                    category: 'General', // Add category to your schema if needed
                    createdAt: testData.createdAt.toISOString(),
                    duration: testData.duration,
                    totalQuestions: testQuestions.length,
                    totalStudents: completedSubmissions.length,
                    averageScore: Math.round(averageScore * 100) / 100,
                    highestScore: Math.round(highestScore * 100) / 100,
                    lowestScore: Math.round(lowestScore * 100) / 100,
                    passRate: Math.round(passRate * 100) / 100
                },
                studentRankings,
                scoreDistribution: scoreRanges,
                questionAnalysis,
                rawScores: scores
            };
        }),

    getStudentDetails: baseProcedure
        .input(z.object({
            testId: z.string(),
            studentId: z.string()
        }))
        .query(async ({ input }) => {
            const { testId, studentId } = input;

            // Get submission with detailed answers
            const submission = await db.select().from(submissions)
                .where(and(
                    eq(submissions.testId, testId),
                    eq(submissions.studentId, studentId)
                ))
                .limit(1);

            if (!submission.length) {
                throw new Error('Submission not found');
            }

            // Get student info
            const student = await db.select().from(users)
                .where(eq(users.id, studentId))
                .limit(1);

            // Get detailed answers
            const studentAnswers = await db.select({
                answer: answers,
                question: questions
            })
                .from(answers)
                .innerJoin(questions, eq(answers.questionId, questions.id))
                .where(eq(answers.submissionId, submission[0].id))
                .orderBy(questions.order);

            return {
                submission: submission[0],
                student: student[0],
                answers: studentAnswers
            };
        })
})

// Helper function to compare arrays
function arraysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
}

// Helper function to generate feedback based on question and correctness
function generateFeedback(question: any, isCorrect: boolean): string {
    if (isCorrect) {
        return "Correct! Well done.";
    } else {
        if (question.questionType === 'multiple_choice' || question.questionType === 'multiple_select') {
            return "Incorrect. Please review the material for this topic.";
        }
        return "This answer needs improvement. Consider reviewing the relevant concepts.";
    }
}