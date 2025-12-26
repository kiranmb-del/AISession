/**
 * Question Validation Schemas
 * Zod schemas for question-related data validation
 */

import { z } from "zod";

/**
 * Question types supported by the application
 */
export const QUESTION_TYPES = ["multiple_choice", "true_false", "short_answer"] as const;

/**
 * Base schema for question creation
 */
export const createQuestionSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  
  questionText: z
    .string()
    .min(1, "Question text is required")
    .max(1000, "Question text must be less than 1000 characters")
    .trim(),
  
  questionType: z.enum(QUESTION_TYPES, {
    errorMap: () => ({ message: "Invalid question type" }),
  }),
  
  points: z
    .number()
    .int("Points must be a whole number")
    .min(1, "Points must be at least 1")
    .max(100, "Points cannot exceed 100")
    .default(1),
  
  orderIndex: z
    .number()
    .int("Order index must be a whole number")
    .min(0, "Order index cannot be negative")
    .default(0),
});

/**
 * Schema for answer options (multiple choice questions)
 */
export const answerOptionSchema = z.object({
  optionText: z
    .string()
    .min(1, "Option text is required")
    .max(500, "Option text must be less than 500 characters")
    .trim(),
  
  isCorrect: z.boolean().default(false),
  
  orderIndex: z
    .number()
    .int("Order index must be a whole number")
    .min(0, "Order index cannot be negative"),
});

/**
 * Schema for creating a multiple choice question
 */
export const createMultipleChoiceQuestionSchema = createQuestionSchema.extend({
  questionType: z.literal("multiple_choice"),
  
  answerOptions: z
    .array(answerOptionSchema)
    .min(2, "Multiple choice questions must have at least 2 options")
    .max(10, "Multiple choice questions cannot have more than 10 options")
    .refine(
      (options) => options.filter((opt) => opt.isCorrect).length >= 1,
      { message: "At least one option must be marked as correct" }
    )
    .refine(
      (options) => options.filter((opt) => opt.isCorrect).length <= options.length,
      { message: "Cannot have more correct options than total options" }
    ),
});

/**
 * Schema for creating a true/false question
 */
export const createTrueFalseQuestionSchema = createQuestionSchema.extend({
  questionType: z.literal("true_false"),
  
  correctAnswer: z.boolean({
    required_error: "Correct answer is required for true/false questions",
  }),
});

/**
 * Schema for creating a short answer question
 */
export const createShortAnswerQuestionSchema = createQuestionSchema.extend({
  questionType: z.literal("short_answer"),
  
  sampleAnswer: z
    .string()
    .max(2000, "Sample answer must be less than 2000 characters")
    .optional()
    .nullable(),
  
  answerGuidelines: z
    .string()
    .max(1000, "Answer guidelines must be less than 1000 characters")
    .optional()
    .nullable(),
});

/**
 * Union schema for creating any question type
 */
export const createAnyQuestionSchema = z.discriminatedUnion("questionType", [
  createMultipleChoiceQuestionSchema,
  createTrueFalseQuestionSchema,
  createShortAnswerQuestionSchema,
]);

/**
 * Schema for updating a question
 */
export const updateQuestionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  
  questionText: z
    .string()
    .min(1, "Question text cannot be empty")
    .max(1000, "Question text must be less than 1000 characters")
    .trim()
    .optional(),
  
  points: z
    .number()
    .int("Points must be a whole number")
    .min(1, "Points must be at least 1")
    .max(100, "Points cannot exceed 100")
    .optional(),
  
  orderIndex: z
    .number()
    .int("Order index must be a whole number")
    .min(0, "Order index cannot be negative")
    .optional(),
  
  // For multiple choice questions
  answerOptions: z.array(answerOptionSchema).optional(),
  
  // For true/false questions
  correctAnswer: z.boolean().optional(),
  
  // For short answer questions
  sampleAnswer: z.string().max(2000).optional().nullable(),
  answerGuidelines: z.string().max(1000).optional().nullable(),
});

/**
 * Schema for reordering questions
 */
export const reorderQuestionsSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  
  questionOrders: z
    .array(
      z.object({
        questionId: z.string().min(1, "Question ID is required"),
        orderIndex: z.number().int().min(0),
      })
    )
    .min(1, "At least one question order must be provided"),
});

/**
 * Schema for deleting a question
 */
export const deleteQuestionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  quizId: z.string().min(1, "Quiz ID is required"),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type AnswerOption = z.infer<typeof answerOptionSchema>;
export type CreateMultipleChoiceQuestionInput = z.infer<typeof createMultipleChoiceQuestionSchema>;
export type CreateTrueFalseQuestionInput = z.infer<typeof createTrueFalseQuestionSchema>;
export type CreateShortAnswerQuestionInput = z.infer<typeof createShortAnswerQuestionSchema>;
export type CreateAnyQuestionInput = z.infer<typeof createAnyQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
export type DeleteQuestionInput = z.infer<typeof deleteQuestionSchema>;
export type QuestionType = typeof QUESTION_TYPES[number];

