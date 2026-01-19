/**
 * Quiz API Routes
 * Handles quiz creation, listing, updating, and deletion
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createQuiz,
  getQuizzesByInstructor,
  getPublishedQuizzes,
  updateQuiz,
  deleteQuiz,
  canPublishQuiz,
} from "@/lib/services/quiz-service";
import { getUserFromToken } from "@/lib/auth";
import { createQuizSchema, updateQuizSchema } from "@/lib/schemas/quiz-schema";

/**
 * GET /api/quizzes
 * Get quizzes based on query parameters
 * - ?instructor_id=xxx - Get quizzes by instructor
 * - ?published=true - Get only published quizzes
 * - no params - Get all quizzes (admin view)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const instructorId = searchParams.get("instructor_id");
    const publishedOnly = searchParams.get("published") === "true";

    let quizzes;

    if (instructorId) {
      // Get quizzes by instructor
      // Verify user has permission (must be the instructor or admin)
      if (user.id !== instructorId && user.user_type !== "instructor") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      quizzes = await getQuizzesByInstructor(instructorId);
    } else if (publishedOnly) {
      // Get only published quizzes (for students)
      quizzes = await getPublishedQuizzes();
    } else {
      // Get all quizzes (admin/instructor view)
      if (user.user_type === "instructor") {
        quizzes = await getQuizzesByInstructor(user.id);
      } else {
        quizzes = await getPublishedQuizzes();
      }
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quizzes
 * Create a new quiz
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can create quizzes
    if (user.user_type !== "instructor") {
      return NextResponse.json(
        { error: "Only instructors can create quizzes" },
        { status: 403 }
      );
    }

    const body = await request.json() as Record<string, unknown>;
    
    // Validate input with Zod schema
    const validation = createQuizSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { title, description, durationMinutes, passingScore } = validation.data;

    // Create the quiz (convert null to undefined for optional fields)
    const quiz = await createQuiz({
      title,
      description: description ?? undefined,
      instructorId: user.id,
      durationMinutes: durationMinutes ?? undefined,
      passingScore: passingScore ?? undefined,
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create quiz" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quizzes (with quiz_id in body)
 * Update an existing quiz
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can update quizzes
    if (user.user_type !== "instructor") {
      return NextResponse.json(
        { error: "Only instructors can update quizzes" },
        { status: 403 }
      );
    }

    const body = await request.json() as Record<string, unknown>;
    
    // Validate input with Zod schema
    const validation = updateQuizSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { quizId, title, description, durationMinutes, passingScore, isPublished } = validation.data;

    // If publishing, check if quiz is ready
    if (isPublished === true) {
      const { canPublish, reason } = await canPublishQuiz(quizId);
      if (!canPublish) {
        return NextResponse.json(
          { error: reason },
          { status: 400 }
        );
      }
    }

    // Update the quiz (convert null to undefined for optional fields)
    const quiz = await updateQuiz(quizId, user.id, {
      title,
      description: description ?? undefined,
      durationMinutes: durationMinutes ?? undefined,
      passingScore: passingScore ?? undefined,
      isPublished,
    });

    return NextResponse.json({ quiz });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update quiz" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quizzes?quiz_id=xxx
 * Delete a quiz
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors can delete quizzes
    if (user.user_type !== "instructor") {
      return NextResponse.json(
        { error: "Only instructors can delete quizzes" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const quizId = searchParams.get("quiz_id");

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    await deleteQuiz(quizId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete quiz" },
      { status: 500 }
    );
  }
}

