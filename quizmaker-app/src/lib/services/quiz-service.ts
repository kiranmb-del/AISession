/**
 * Quiz Service
 * Handles quiz-related database operations
 */

import "server-only";
import { executeQuery, executeQueryFirst, executeMutation, generateId } from "../d1-client";

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  duration_minutes: number | null;
  passing_score: number | null;
  is_published: number;
  created_at: string;
  updated_at: string;
}

export interface QuizWithInstructor extends Quiz {
  instructor_name: string;
  instructor_email: string;
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  instructorId: string;
  durationMinutes?: number;
  passingScore?: number;
}

export interface UpdateQuizInput {
  title?: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  isPublished?: boolean;
}

/**
 * Create a new quiz
 */
export async function createQuiz(input: CreateQuizInput): Promise<Quiz> {
  const { title, description, instructorId, durationMinutes, passingScore } = input;
  
  // Validate that the instructor exists and is actually an instructor
  const instructorCheckSql = "SELECT id, user_type FROM users WHERE id = ? AND user_type = 'instructor'";
  const instructor = await executeQueryFirst<{ id: string; user_type: string }>(
    instructorCheckSql,
    [instructorId]
  );
  
  if (!instructor) {
    throw new Error("Invalid instructor ID or user is not an instructor");
  }
  
  // Generate quiz ID
  const quizId = generateId("quiz");
  
  // Insert quiz
  const sql = `
    INSERT INTO quizzes (id, title, description, instructor_id, duration_minutes, passing_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  await executeMutation(sql, [
    quizId,
    title,
    description || null,
    instructorId,
    durationMinutes || null,
    passingScore || null,
  ]);
  
  // Return the created quiz
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    throw new Error("Failed to create quiz");
  }
  
  return quiz;
}

/**
 * Get quiz by ID
 */
export async function getQuizById(id: string): Promise<Quiz | null> {
  const sql = "SELECT * FROM quizzes WHERE id = ?";
  return await executeQueryFirst<Quiz>(sql, [id]);
}

/**
 * Get quiz by ID with instructor information
 */
export async function getQuizWithInstructor(id: string): Promise<QuizWithInstructor | null> {
  const sql = `
    SELECT 
      q.*,
      u.full_name as instructor_name,
      u.email as instructor_email
    FROM quizzes q
    JOIN users u ON q.instructor_id = u.id
    WHERE q.id = ?
  `;
  return await executeQueryFirst<QuizWithInstructor>(sql, [id]);
}

/**
 * Get all quizzes by instructor
 */
export async function getQuizzesByInstructor(instructorId: string): Promise<Quiz[]> {
  const sql = `
    SELECT * FROM quizzes 
    WHERE instructor_id = ? 
    ORDER BY created_at DESC
  `;
  return await executeQuery<Quiz>(sql, [instructorId]);
}

/**
 * Get all published quizzes
 */
export async function getPublishedQuizzes(): Promise<QuizWithInstructor[]> {
  const sql = `
    SELECT 
      q.*,
      u.full_name as instructor_name,
      u.email as instructor_email
    FROM quizzes q
    JOIN users u ON q.instructor_id = u.id
    WHERE q.is_published = 1
    ORDER BY q.created_at DESC
  `;
  return await executeQuery<QuizWithInstructor>(sql);
}

/**
 * Get all quizzes (admin/instructor view)
 */
export async function getAllQuizzes(): Promise<QuizWithInstructor[]> {
  const sql = `
    SELECT 
      q.*,
      u.full_name as instructor_name,
      u.email as instructor_email
    FROM quizzes q
    JOIN users u ON q.instructor_id = u.id
    ORDER BY q.created_at DESC
  `;
  return await executeQuery<QuizWithInstructor>(sql);
}

/**
 * Update quiz
 */
export async function updateQuiz(
  id: string,
  instructorId: string,
  updates: UpdateQuizInput
): Promise<Quiz> {
  // Verify quiz exists and belongs to instructor
  const quiz = await getQuizById(id);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  
  if (quiz.instructor_id !== instructorId) {
    throw new Error("You do not have permission to update this quiz");
  }
  
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];
  
  if (updates.title !== undefined) {
    updateFields.push("title = ?");
    updateValues.push(updates.title);
  }
  
  if (updates.description !== undefined) {
    updateFields.push("description = ?");
    updateValues.push(updates.description || null);
  }
  
  if (updates.durationMinutes !== undefined) {
    updateFields.push("duration_minutes = ?");
    updateValues.push(updates.durationMinutes || null);
  }
  
  if (updates.passingScore !== undefined) {
    updateFields.push("passing_score = ?");
    updateValues.push(updates.passingScore || null);
  }
  
  if (updates.isPublished !== undefined) {
    updateFields.push("is_published = ?");
    updateValues.push(updates.isPublished ? 1 : 0);
  }
  
  if (updateFields.length === 0) {
    return quiz;
  }
  
  updateFields.push("updated_at = CURRENT_TIMESTAMP");
  updateValues.push(id);
  
  const sql = `
    UPDATE quizzes
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `;
  
  await executeMutation(sql, updateValues);
  
  const updatedQuiz = await getQuizById(id);
  if (!updatedQuiz) {
    throw new Error("Failed to update quiz");
  }
  
  return updatedQuiz;
}

/**
 * Publish a quiz
 */
export async function publishQuiz(id: string, instructorId: string): Promise<Quiz> {
  return await updateQuiz(id, instructorId, { isPublished: true });
}

/**
 * Unpublish a quiz
 */
export async function unpublishQuiz(id: string, instructorId: string): Promise<Quiz> {
  return await updateQuiz(id, instructorId, { isPublished: false });
}

/**
 * Delete quiz (and all related questions, answer options, attempts)
 */
export async function deleteQuiz(id: string, instructorId: string): Promise<void> {
  // Verify quiz exists and belongs to instructor
  const quiz = await getQuizById(id);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  
  if (quiz.instructor_id !== instructorId) {
    throw new Error("You do not have permission to delete this quiz");
  }
  
  // Delete quiz (cascade will handle related records)
  const sql = "DELETE FROM quizzes WHERE id = ?";
  await executeMutation(sql, [id]);
}

/**
 * Get quiz statistics
 */
export interface QuizStats {
  quiz_id: string;
  total_attempts: number;
  completed_attempts: number;
  average_score: number | null;
  pass_rate: number | null;
}

export async function getQuizStats(quizId: string): Promise<QuizStats> {
  const sql = `
    SELECT 
      ? as quiz_id,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_attempts,
      AVG(CASE WHEN status = 'completed' THEN score ELSE NULL END) as average_score,
      CASE 
        WHEN COUNT(CASE WHEN status = 'completed' THEN 1 END) > 0 
        THEN (
          SUM(CASE 
            WHEN status = 'completed' 
            AND score >= (SELECT passing_score FROM quizzes WHERE id = ?)
            THEN 1 ELSE 0 
          END) * 100.0 / COUNT(CASE WHEN status = 'completed' THEN 1 END)
        )
        ELSE NULL
      END as pass_rate
    FROM quiz_attempts
    WHERE quiz_id = ?
  `;
  
  const stats = await executeQueryFirst<QuizStats>(sql, [quizId, quizId, quizId]);
  
  return stats || {
    quiz_id: quizId,
    total_attempts: 0,
    completed_attempts: 0,
    average_score: null,
    pass_rate: null,
  };
}

/**
 * Get question count for a quiz
 */
export async function getQuizQuestionCount(quizId: string): Promise<number> {
  const sql = "SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?";
  const result = await executeQueryFirst<{ count: number }>(sql, [quizId]);
  return result?.count || 0;
}

/**
 * Check if quiz is ready to publish (has at least one question)
 */
export async function canPublishQuiz(quizId: string): Promise<{ canPublish: boolean; reason?: string }> {
  const questionCount = await getQuizQuestionCount(quizId);
  
  if (questionCount === 0) {
    return {
      canPublish: false,
      reason: "Quiz must have at least one question to be published",
    };
  }
  
  return { canPublish: true };
}

