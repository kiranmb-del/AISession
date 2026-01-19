/**
 * Question API Routes
 * Handles CRUD operations for questions within a quiz
 */

import { NextRequest, NextResponse } from "next/server";
import { getQuestionsByQuiz, createQuestion, CreateQuestionInput } from "@/lib/services/quiz-service";
import { getUserFromToken } from "@/lib/auth";
import { createAnyQuestionSchema } from "@/lib/schemas/question.schema";
import { z } from "zod";

/**
 * GET /api/quizzes/[id]/questions
 * Get all questions for a quiz
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    
    // Verify user is authenticated
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get questions with options
    const questions = await getQuestionsByQuiz(quizId);
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quizzes/[id]/questions
 * Create a new question
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await params;
    
    // Verify user is authenticated and is an instructor
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (user.user_type !== "instructor") {
      return NextResponse.json(
        { error: "Only instructors can create questions" },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json() as Record<string, unknown>;
    
    // Validate based on question type
    const validatedData = createAnyQuestionSchema.parse({
      ...body,
      quizId,
    });
    
    // Create question with appropriate data structure
    const createData: CreateQuestionInput = {
      quizId,
      questionText: validatedData.questionText,
      questionType: validatedData.questionType,
      points: validatedData.points,
      orderIndex: validatedData.orderIndex,
    };
    
    if (validatedData.questionType === "multiple_choice") {
      createData.answerOptions = validatedData.answerOptions;
    } else if (validatedData.questionType === "true_false") {
      createData.correctAnswer = validatedData.correctAnswer;
    } else if (validatedData.questionType === "short_answer") {
      // Convert null to undefined for compatibility with service layer
      createData.sampleAnswer = validatedData.sampleAnswer ?? undefined;
      createData.answerGuidelines = validatedData.answerGuidelines ?? undefined;
    }
    
    const question = await createQuestion(createData);
    
    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create question" },
      { status: 500 }
    );
  }
}

