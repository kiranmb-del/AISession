/**
 * Quiz Publish API Route
 * POST /api/quizzes/[id]/publish - Publish a quiz
 * POST /api/quizzes/[id]/unpublish - Unpublish a quiz
 */

import { NextRequest, NextResponse } from "next/server";
import {
  publishQuiz,
  unpublishQuiz,
  canPublishQuiz,
} from "@/lib/services/quiz-service";
import { getUserFromToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can publish/unpublish quizzes
    if (user.user_type !== "instructor") {
      return NextResponse.json(
        { error: "Only instructors can publish quizzes" },
        { status: 403 }
      );
    }

    const { id: quizId, action } = await params;

    if (action === "publish") {
      // Check if quiz can be published
      const { canPublish, reason } = await canPublishQuiz(quizId);
      if (!canPublish) {
        return NextResponse.json({ error: reason }, { status: 400 });
      }

      const quiz = await publishQuiz(quizId, user.id);
      return NextResponse.json({ quiz, message: "Quiz published successfully" });
    } else if (action === "unpublish") {
      const quiz = await unpublishQuiz(quizId, user.id);
      return NextResponse.json({ quiz, message: "Quiz unpublished successfully" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error publishing/unpublishing quiz:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update quiz status" },
      { status: 500 }
    );
  }
}

