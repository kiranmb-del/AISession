/**
 * Question Reorder API Route
 * Handles reordering questions within a quiz
 */

import { NextRequest, NextResponse } from "next/server";
import { reorderQuestions } from "@/lib/services/quiz-service";
import { getUserFromToken } from "@/lib/auth";
import { reorderQuestionsSchema } from "@/lib/schemas/question.schema";
import { z } from "zod";

/**
 * POST /api/quizzes/[id]/questions/reorder
 * Reorder questions in a quiz
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
        { error: "Only instructors can reorder questions" },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    const body = await request.json() as Record<string, unknown>;
    const validatedData = reorderQuestionsSchema.parse({
      ...body,
      quizId,
    });
    
    await reorderQuestions(quizId, user.id, validatedData.questionOrders);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering questions:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reorder questions" },
      { status: 500 }
    );
  }
}

