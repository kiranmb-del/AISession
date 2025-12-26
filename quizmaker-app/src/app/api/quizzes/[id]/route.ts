/**
 * Individual Quiz API Routes
 * GET /api/quizzes/[id] - Get specific quiz details
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getQuizWithInstructor,
  getQuizStats,
  getQuizQuestionCount,
} from "@/lib/services/quiz-service";
import { getUserFromToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizId = params.id;

    // Get quiz with instructor info
    const quiz = await getQuizWithInstructor(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check permissions
    // Students can only see published quizzes
    // Instructors can see their own quizzes regardless of publish status
    if (user.user_type === "student" && quiz.is_published !== 1) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (user.user_type === "instructor" && quiz.instructor_id !== user.id) {
      // Other instructors can only see published quizzes
      if (quiz.is_published !== 1) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }
    }

    // Get additional info
    const questionCount = await getQuizQuestionCount(quizId);
    const stats = user.user_type === "instructor" && quiz.instructor_id === user.id
      ? await getQuizStats(quizId)
      : null;

    return NextResponse.json({
      quiz,
      questionCount,
      stats,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

