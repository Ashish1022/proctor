import { z } from 'zod';

export const questionSchema = z.object({
    questionText: z.string().min(1, "Question text is required"),
    questionType: z.enum(['multiple_choice', 'multiple_select']),
    options: z.array(z.string()).min(2, "At least 2 options required"),
    correctAnswers: z.array(z.number()).min(1, "At least one correct answer required"),
    marks: z.number().min(1, "Marks must be at least 1"),
    order: z.number(),
});

export const createTestSchema = z.object({
    title: z.string().min(1, "Test title is required"),
    description: z.string().optional(),
    instructions: z.string().optional(),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    targetYears: z.array(z.enum(['BE', 'SE', 'TE'])).min(1, "At least one target year must be selected"),
    questions: z.array(questionSchema).min(1, "At least one question is required"),
});

export const updateTestSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Test title is required"),
    description: z.string().optional(),
    instructions: z.string().optional(),
    duration: z.number().min(1, "Duration must be at least 1 minute"),
    startTime: z.date().optional(),
    endTime: z.date().optional(),
    targetYears: z.array(z.enum(['BE', 'SE', 'TE'])).min(1, "At least one target year must be selected").optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
});