/**
 * Student Quiz Detail API Route
 * GET /api/student/quizzes/[id] - Get quiz details and check for active attempts
 */

import { NextRequest, NextResponse } from "next/server";
import { getQuizWithInstructor, getQuestionsByQuiz } from "@/lib/services/quiz-service";
import { getActiveAttempt, getAttemptsByQuiz } from "@/lib/services/quiz-attempt-service";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
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
        { error: "Only students can access this endpoint" },
        { status: 403 }
      );
    }

    const { id: quizId } = await params;

    // Get quiz details
    const quiz = await getQuizWithInstructor(quizId);
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Check if quiz is published
    if (quiz.is_published !== 1) {
      return NextResponse.json(
        { error: "Quiz is not available" },
        { status: 403 }
      );
    }

    // Get question count
    const questions = await getQuestionsByQuiz(quizId);

    // Check for active attempt
    const activeAttempt = await getActiveAttempt(quizId, user.userId);

    // Get all previous attempts
    const previousAttempts = await getAttemptsByQuiz(quizId, user.userId);

    return NextResponse.json({
      quiz: {
        ...quiz,
        question_count: questions.length,
      },
      activeAttempt,
      previousAttempts,
      canStart: !activeAttempt, // Can only start if no active attempt
    });
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz details" },
      { status: 500 }
    );
  }
}

