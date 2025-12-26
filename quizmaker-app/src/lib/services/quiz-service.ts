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

// ============================================================================
// QUESTION MANAGEMENT
// ============================================================================

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  points: number;
  order_index: number;
  created_at: string;
}

export interface AnswerOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: number;
  order_index: number;
}

export interface QuestionWithOptions extends Question {
  answer_options: AnswerOption[];
}

export interface CreateQuestionInput {
  quizId: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  points?: number;
  orderIndex?: number;
  // For multiple choice questions
  answerOptions?: Array<{
    optionText: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
  // For true/false questions
  correctAnswer?: boolean;
  // For short answer questions (metadata stored in answer_options for consistency)
  sampleAnswer?: string;
  answerGuidelines?: string;
}

export interface UpdateQuestionInput {
  questionText?: string;
  points?: number;
  orderIndex?: number;
  answerOptions?: Array<{
    id?: string; // If provided, update existing option
    optionText: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
  correctAnswer?: boolean;
  sampleAnswer?: string;
  answerGuidelines?: string;
}

/**
 * Create a new question with its answer options
 */
export async function createQuestion(input: CreateQuestionInput): Promise<QuestionWithOptions> {
  const { quizId, questionText, questionType, points = 1, orderIndex, answerOptions, correctAnswer, sampleAnswer, answerGuidelines } = input;
  
  // Verify quiz exists
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  
  // If orderIndex not provided, get the next available index
  let finalOrderIndex = orderIndex;
  if (finalOrderIndex === undefined) {
    const countSql = "SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?";
    const countResult = await executeQueryFirst<{ count: number }>(countSql, [quizId]);
    finalOrderIndex = countResult?.count || 0;
  }
  
  // Generate question ID
  const questionId = generateId("question");
  
  // Insert question
  const questionSql = `
    INSERT INTO questions (id, quiz_id, question_text, question_type, points, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  await executeMutation(questionSql, [
    questionId,
    quizId,
    questionText,
    questionType,
    points,
    finalOrderIndex,
  ]);
  
  // Handle answer options based on question type
  const createdOptions: AnswerOption[] = [];
  
  if (questionType === "multiple_choice" && answerOptions && answerOptions.length > 0) {
    // Insert multiple choice options
    for (const option of answerOptions) {
      const optionId = generateId("option");
      const optionSql = `
        INSERT INTO answer_options (id, question_id, option_text, is_correct, order_index)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await executeMutation(optionSql, [
        optionId,
        questionId,
        option.optionText,
        option.isCorrect ? 1 : 0,
        option.orderIndex,
      ]);
      
      createdOptions.push({
        id: optionId,
        question_id: questionId,
        option_text: option.optionText,
        is_correct: option.isCorrect ? 1 : 0,
        order_index: option.orderIndex,
      });
    }
  } else if (questionType === "true_false" && correctAnswer !== undefined) {
    // Create True and False options
    const trueOptionId = generateId("option");
    const falseOptionId = generateId("option");
    
    const trueSql = `
      INSERT INTO answer_options (id, question_id, option_text, is_correct, order_index)
      VALUES (?, ?, ?, ?, ?)
    `;
    const falseSql = `
      INSERT INTO answer_options (id, question_id, option_text, is_correct, order_index)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await executeMutation(trueSql, [trueOptionId, questionId, "True", correctAnswer ? 1 : 0, 0]);
    await executeMutation(falseSql, [falseOptionId, questionId, "False", correctAnswer ? 0 : 1, 1]);
    
    createdOptions.push(
      {
        id: trueOptionId,
        question_id: questionId,
        option_text: "True",
        is_correct: correctAnswer ? 1 : 0,
        order_index: 0,
      },
      {
        id: falseOptionId,
        question_id: questionId,
        option_text: "False",
        is_correct: correctAnswer ? 0 : 1,
        order_index: 1,
      }
    );
  } else if (questionType === "short_answer") {
    // Store sample answer and guidelines as metadata in answer_options
    // We use a special format to distinguish metadata from actual answer options
    if (sampleAnswer || answerGuidelines) {
      const metadataId = generateId("option");
      const metadataSql = `
        INSERT INTO answer_options (id, question_id, option_text, is_correct, order_index)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const metadata = JSON.stringify({
        sampleAnswer: sampleAnswer || null,
        answerGuidelines: answerGuidelines || null,
      });
      
      await executeMutation(metadataSql, [metadataId, questionId, metadata, 0, 0]);
      
      createdOptions.push({
        id: metadataId,
        question_id: questionId,
        option_text: metadata,
        is_correct: 0,
        order_index: 0,
      });
    }
  }
  
  // Return the created question with options
  const question = await getQuestionById(questionId);
  if (!question) {
    throw new Error("Failed to create question");
  }
  
  return {
    ...question,
    answer_options: createdOptions,
  };
}

/**
 * Get question by ID
 */
export async function getQuestionById(id: string): Promise<Question | null> {
  const sql = "SELECT * FROM questions WHERE id = ?";
  return await executeQueryFirst<Question>(sql, [id]);
}

/**
 * Get question by ID with answer options
 */
export async function getQuestionWithOptions(id: string): Promise<QuestionWithOptions | null> {
  const question = await getQuestionById(id);
  if (!question) {
    return null;
  }
  
  const optionsSql = "SELECT * FROM answer_options WHERE question_id = ? ORDER BY order_index";
  const options = await executeQuery<AnswerOption>(optionsSql, [id]);
  
  return {
    ...question,
    answer_options: options,
  };
}

/**
 * Get all questions for a quiz with their answer options
 */
export async function getQuestionsByQuiz(quizId: string): Promise<QuestionWithOptions[]> {
  const questionsSql = "SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index";
  const questions = await executeQuery<Question>(questionsSql, [quizId]);
  
  // Fetch answer options for all questions
  const questionsWithOptions: QuestionWithOptions[] = [];
  
  for (const question of questions) {
    const optionsSql = "SELECT * FROM answer_options WHERE question_id = ? ORDER BY order_index";
    const options = await executeQuery<AnswerOption>(optionsSql, [question.id]);
    
    questionsWithOptions.push({
      ...question,
      answer_options: options,
    });
  }
  
  return questionsWithOptions;
}

/**
 * Update a question
 */
export async function updateQuestion(
  questionId: string,
  instructorId: string,
  updates: UpdateQuestionInput
): Promise<QuestionWithOptions> {
  // Verify question exists and belongs to instructor's quiz
  const question = await getQuestionById(questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  
  const quiz = await getQuizById(question.quiz_id);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  
  if (quiz.instructor_id !== instructorId) {
    throw new Error("You do not have permission to update this question");
  }
  
  // Update question fields
  const updateFields: string[] = [];
  const updateValues: unknown[] = [];
  
  if (updates.questionText !== undefined) {
    updateFields.push("question_text = ?");
    updateValues.push(updates.questionText);
  }
  
  if (updates.points !== undefined) {
    updateFields.push("points = ?");
    updateValues.push(updates.points);
  }
  
  if (updates.orderIndex !== undefined) {
    updateFields.push("order_index = ?");
    updateValues.push(updates.orderIndex);
  }
  
  if (updateFields.length > 0) {
    updateValues.push(questionId);
    
    const sql = `
      UPDATE questions
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;
    
    await executeMutation(sql, updateValues);
  }
  
  // Handle answer options updates based on question type
  if (updates.answerOptions && question.question_type === "multiple_choice") {
    // Delete existing options and recreate
    await executeMutation("DELETE FROM answer_options WHERE question_id = ?", [questionId]);
    
    for (const option of updates.answerOptions) {
      const optionId = option.id || generateId("option");
      const optionSql = `
        INSERT INTO answer_options (id, question_id, option_text, is_correct, order_index)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      await executeMutation(optionSql, [
        optionId,
        questionId,
        option.optionText,
        option.isCorrect ? 1 : 0,
        option.orderIndex,
      ]);
    }
  } else if (updates.correctAnswer !== undefined && question.question_type === "true_false") {
    // Update true/false options
    await executeMutation(
      "UPDATE answer_options SET is_correct = ? WHERE question_id = ? AND option_text = 'True'",
      [updates.correctAnswer ? 1 : 0, questionId]
    );
    await executeMutation(
      "UPDATE answer_options SET is_correct = ? WHERE question_id = ? AND option_text = 'False'",
      [updates.correctAnswer ? 0 : 1, questionId]
    );
  } else if ((updates.sampleAnswer !== undefined || updates.answerGuidelines !== undefined) && question.question_type === "short_answer") {
    // Update short answer metadata
    const metadata = JSON.stringify({
      sampleAnswer: updates.sampleAnswer || null,
      answerGuidelines: updates.answerGuidelines || null,
    });
    
    // Check if metadata already exists
    const existingMetadata = await executeQueryFirst<AnswerOption>(
      "SELECT * FROM answer_options WHERE question_id = ? LIMIT 1",
      [questionId]
    );
    
    if (existingMetadata) {
      await executeMutation(
        "UPDATE answer_options SET option_text = ? WHERE id = ?",
        [metadata, existingMetadata.id]
      );
    } else {
      const metadataId = generateId("option");
      await executeMutation(
        "INSERT INTO answer_options (id, question_id, option_text, is_correct, order_index) VALUES (?, ?, ?, ?, ?)",
        [metadataId, questionId, metadata, 0, 0]
      );
    }
  }
  
  // Return updated question with options
  const updatedQuestion = await getQuestionWithOptions(questionId);
  if (!updatedQuestion) {
    throw new Error("Failed to update question");
  }
  
  return updatedQuestion;
}

/**
 * Delete a question (and all its answer options via cascade)
 */
export async function deleteQuestion(questionId: string, instructorId: string): Promise<void> {
  // Verify question exists and belongs to instructor's quiz
  const question = await getQuestionById(questionId);
  if (!question) {
    throw new Error("Question not found");
  }
  
  const quiz = await getQuizById(question.quiz_id);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  
  if (quiz.instructor_id !== instructorId) {
    throw new Error("You do not have permission to delete this question");
  }
  
  // Delete question (cascade will handle answer options)
  const sql = "DELETE FROM questions WHERE id = ?";
  await executeMutation(sql, [questionId]);
  
  // Reorder remaining questions
  await reorderQuestionsAfterDelete(question.quiz_id, question.order_index);
}

/**
 * Reorder questions after a deletion
 */
async function reorderQuestionsAfterDelete(quizId: string, deletedOrderIndex: number): Promise<void> {
  const sql = `
    UPDATE questions
    SET order_index = order_index - 1
    WHERE quiz_id = ? AND order_index > ?
  `;
  await executeMutation(sql, [quizId, deletedOrderIndex]);
}

/**
 * Reorder questions in a quiz
 */
export async function reorderQuestions(
  quizId: string,
  instructorId: string,
  questionOrders: Array<{ questionId: string; orderIndex: number }>
): Promise<void> {
  // Verify quiz exists and belongs to instructor
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }
  
  if (quiz.instructor_id !== instructorId) {
    throw new Error("You do not have permission to reorder questions in this quiz");
  }
  
  // Update each question's order_index
  for (const { questionId, orderIndex } of questionOrders) {
    const sql = "UPDATE questions SET order_index = ? WHERE id = ? AND quiz_id = ?";
    await executeMutation(sql, [orderIndex, questionId, quizId]);
  }
}

