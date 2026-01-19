/**
 * Student Quizzes API Route
 * GET /api/student/quizzes - Get all published quizzes for students to browse
 */

import { NextResponse } from "next/server";
import { getPublishedQuizzes } from "@/lib/services/quiz-service";
import { getQuestionsByQuiz } from "@/lib/services/quiz-service";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // Verify user is authenticated and is a student
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

    // Get all published quizzes
    const quizzes = await getPublishedQuizzes();

    // Enhance each quiz with question count
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await getQuestionsByQuiz(quiz.id);
        return {
          ...quiz,
          question_count: questions.length,
        };
      })
    );

    return NextResponse.json(quizzesWithCount);
  } catch (error) {
    console.error("Error fetching published quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

