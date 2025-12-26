/**
 * Quiz Validation Schemas
 * Zod schemas for quiz-related data validation
 */

import { z } from "zod";

/**
 * Schema for creating a new quiz
 */
export const createQuizSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  
  durationMinutes: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 600 minutes")
    .optional()
    .nullable(),
  
  passingScore: z
    .number()
    .int("Passing score must be a whole number")
    .min(0, "Passing score must be at least 0")
    .max(100, "Passing score cannot exceed 100")
    .optional()
    .nullable(),
});

/**
 * Schema for updating a quiz
 */
export const updateQuizSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be less than 200 characters")
    .trim()
    .optional(),
  
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  
  durationMinutes: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration cannot exceed 600 minutes")
    .optional()
    .nullable(),
  
  passingScore: z
    .number()
    .int("Passing score must be a whole number")
    .min(0, "Passing score must be at least 0")
    .max(100, "Passing score cannot exceed 100")
    .optional()
    .nullable(),
  
  isPublished: z
    .boolean()
    .optional(),
});

/**
 * Schema for quiz filters
 */
export const quizFiltersSchema = z.object({
  instructorId: z.string().optional(),
  published: z.boolean().optional(),
  sortBy: z.enum(["created_at", "updated_at", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuizFilters = z.infer<typeof quizFiltersSchema>;

