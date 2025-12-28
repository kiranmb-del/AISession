/**
 * Start Quiz Attempt API Route
 * POST /api/student/quizzes/[id]/start - Create a new quiz attempt
 */

import { NextRequest, NextResponse } from "next/server";
import { getQuizById } from "@/lib/services/quiz-service";
import { createQuizAttempt } from "@/lib/services/quiz-attempt-service";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.userType !== 'student') {
      return NextResponse.json(
        { error: "Only students can start quizzes" },
        { status: 403 }
      );
    }

    const { id: quizId } = await params;

    // Verify quiz exists and is published
    const quiz = await getQuizById(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (quiz.is_published !== 1) {
      return NextResponse.json(
        { error: "Quiz is not available" },
        { status: 403 }
      );
    }

    // Create quiz attempt
    const attempt = await createQuizAttempt({
      quiz_id: quizId,
      student_id: user.userId,
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("Error starting quiz:", error);
    
    // Handle specific error for duplicate attempt
    if (error instanceof Error && error.message.includes("already have an in-progress attempt")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}

