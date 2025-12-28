/**
 * Quiz Attempt Service
 * Handles quiz attempt-related database operations for students taking quizzes
 */

import "server-only";
import { executeQuery, executeQueryFirst, executeMutation, generateId } from "../d1-client";

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  started_at: string;
  completed_at: string | null;
  score: number | null;
  total_points: number | null;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizAttemptWithDetails extends QuizAttempt {
  quiz_title: string;
  quiz_description: string | null;
  quiz_duration_minutes: number | null;
  quiz_passing_score: number | null;
  instructor_name: string;
}

export interface CreateQuizAttemptInput {
  quiz_id: string;
  student_id: string;
}

/**
 * Create a new quiz attempt
 * Students can only have one in-progress attempt per quiz at a time
 */
export async function createQuizAttempt(input: CreateQuizAttemptInput): Promise<QuizAttempt> {
  const { quiz_id, student_id } = input;

  // Check if student already has an in-progress attempt for this quiz
  const existingAttempt = await getActiveAttempt(quiz_id, student_id);
  if (existingAttempt) {
    throw new Error("You already have an in-progress attempt for this quiz");
  }

  const id = generateId();
  const sql = `
    INSERT INTO quiz_attempts (
      id, quiz_id, student_id, started_at, status
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'in_progress')
  `;

  await executeMutation(sql, [id, quiz_id, student_id]);

  // Fetch and return the created attempt
  const attempt = await getAttemptById(id);
  if (!attempt) {
    throw new Error("Failed to create quiz attempt");
  }

  return attempt;
}

/**
 * Get quiz attempt by ID
 */
export async function getAttemptById(id: string): Promise<QuizAttempt | null> {
  const sql = `
    SELECT * FROM quiz_attempts 
    WHERE id = ?
  `;
  return await executeQueryFirst<QuizAttempt>(sql, [id]);
}

/**
 * Get quiz attempt with full details (quiz info, instructor)
 */
export async function getAttemptWithDetails(id: string): Promise<QuizAttemptWithDetails | null> {
  const sql = `
    SELECT 
      qa.*,
      q.title as quiz_title,
      q.description as quiz_description,
      q.duration_minutes as quiz_duration_minutes,
      q.passing_score as quiz_passing_score,
      u.full_name as instructor_name
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    JOIN users u ON q.instructor_id = u.id
    WHERE qa.id = ?
  `;
  return await executeQueryFirst<QuizAttemptWithDetails>(sql, [id]);
}

/**
 * Get all attempts by a student
 */
export async function getAttemptsByStudent(studentId: string): Promise<QuizAttemptWithDetails[]> {
  const sql = `
    SELECT 
      qa.*,
      q.title as quiz_title,
      q.description as quiz_description,
      q.duration_minutes as quiz_duration_minutes,
      q.passing_score as quiz_passing_score,
      u.full_name as instructor_name
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    JOIN users u ON q.instructor_id = u.id
    WHERE qa.student_id = ?
    ORDER BY qa.started_at DESC
  `;
  return await executeQuery<QuizAttemptWithDetails>(sql, [studentId]);
}

/**
 * Get active (in-progress) attempt for a student and quiz
 * Used to prevent duplicate attempts
 */
export async function getActiveAttempt(
  quizId: string, 
  studentId: string
): Promise<QuizAttempt | null> {
  const sql = `
    SELECT * FROM quiz_attempts 
    WHERE quiz_id = ? 
      AND student_id = ? 
      AND status = 'in_progress'
    LIMIT 1
  `;
  return await executeQueryFirst<QuizAttempt>(sql, [quizId, studentId]);
}

/**
 * Get all attempts for a specific quiz (for student to see their history)
 */
export async function getAttemptsByQuiz(
  quizId: string, 
  studentId: string
): Promise<QuizAttempt[]> {
  const sql = `
    SELECT * FROM quiz_attempts 
    WHERE quiz_id = ? 
      AND student_id = ?
    ORDER BY started_at DESC
  `;
  return await executeQuery<QuizAttempt>(sql, [quizId, studentId]);
}

/**
 * Update attempt status and completion time
 */
export async function completeAttempt(
  attemptId: string,
  score: number,
  totalPoints: number
): Promise<QuizAttempt> {
  // First verify the attempt exists and is in progress
  const attempt = await getAttemptById(attemptId);
  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }
  if (attempt.status !== 'in_progress') {
    throw new Error("Quiz attempt is not in progress");
  }

  const sql = `
    UPDATE quiz_attempts 
    SET 
      status = 'completed',
      completed_at = CURRENT_TIMESTAMP,
      score = ?,
      total_points = ?
    WHERE id = ?
  `;

  await executeMutation(sql, [score, totalPoints, attemptId]);

  // Fetch and return updated attempt
  const updatedAttempt = await getAttemptById(attemptId);
  if (!updatedAttempt) {
    throw new Error("Failed to retrieve updated quiz attempt");
  }

  return updatedAttempt;
}

/**
 * Abandon an attempt (student leaves without completing)
 */
export async function abandonAttempt(attemptId: string): Promise<QuizAttempt> {
  const attempt = await getAttemptById(attemptId);
  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }
  if (attempt.status !== 'in_progress') {
    throw new Error("Quiz attempt is not in progress");
  }

  const sql = `
    UPDATE quiz_attempts 
    SET status = 'abandoned'
    WHERE id = ?
  `;

  await executeMutation(sql, [attemptId]);

  const updatedAttempt = await getAttemptById(attemptId);
  if (!updatedAttempt) {
    throw new Error("Failed to retrieve updated quiz attempt");
  }

  return updatedAttempt;
}

/**
 * Get student statistics (total attempts, completed, average score)
 */
export async function getStudentStats(studentId: string) {
  const sql = `
    SELECT 
      COUNT(*) as total_attempts,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_attempts,
      ROUND(AVG(CASE WHEN status = 'completed' AND score IS NOT NULL AND total_points > 0 
        THEN (score * 100.0 / total_points) 
        ELSE NULL 
      END), 2) as average_score_percentage
    FROM quiz_attempts
    WHERE student_id = ?
  `;
  
  interface StatsResult {
    total_attempts: number;
    completed_attempts: number;
    average_score_percentage: number | null;
  }

  return await executeQueryFirst<StatsResult>(sql, [studentId]);
}

