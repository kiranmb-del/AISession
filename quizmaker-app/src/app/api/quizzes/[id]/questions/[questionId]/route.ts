/**
 * Single Question API Routes
 * Handles operations on individual questions
 */

import { NextRequest, NextResponse } from "next/server";
import { getQuestionWithOptions, updateQuestion, deleteQuestion } from "@/lib/services/quiz-service";
import { getUserFromToken } from "@/lib/auth";
import { updateQuestionSchema } from "@/lib/schemas/question.schema";
import { z } from "zod";

/**
 * GET /api/quizzes/[id]/questions/[questionId]
 * Get a specific question with its options
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { questionId } = await params;
    
    // Verify user is authenticated
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get question with options
    const question = await getQuestionWithOptions(questionId);
    
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    
    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch question" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quizzes/[id]/questions/[questionId]
 * Update a question
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { questionId } = await params;
    
    // Verify user is authenticated and is an instructor
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (user.user_type !== "instructor") {
      return NextResponse.json(
        { error: "Only instructors can update questions" },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json() as Record<string, unknown>;
    const validatedData = updateQuestionSchema.parse({
      ...body,
      questionId,
    });
    
    // Extract update data (excluding questionId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { questionId: _, ...rawUpdateData } = validatedData;
    
    // Convert null values to undefined for compatibility with service layer
    const updateData = {
      ...rawUpdateData,
      sampleAnswer: rawUpdateData.sampleAnswer === null ? undefined : rawUpdateData.sampleAnswer,
      answerGuidelines: rawUpdateData.answerGuidelines === null ? undefined : rawUpdateData.answerGuidelines,
    };
    
    const question = await updateQuestion(questionId, user.id, updateData);
    
    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error updating question:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update question" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quizzes/[id]/questions/[questionId]
 * Delete a question
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { questionId } = await params;
    
    // Verify user is authenticated and is an instructor
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (user.user_type !== "instructor") {
      return NextResponse.json(
        { error: "Only instructors can delete questions" },
        { status: 403 }
      );
    }
    
    await deleteQuestion(questionId, user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete question" },
      { status: 500 }
    );
  }
}

