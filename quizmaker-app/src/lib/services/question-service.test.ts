/**
 * Question Service Unit Tests
 * Tests for question CRUD operations and validation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createQuestion,
  getQuestionById,
  getQuestionWithOptions,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "./quiz-service";
import * as d1Client from "../d1-client";

// Mock the d1-client module
vi.mock("../d1-client", () => ({
  executeQuery: vi.fn(),
  executeQueryFirst: vi.fn(),
  executeMutation: vi.fn(),
  generateId: vi.fn(),
}));

describe("Question Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default ID generator
    let idCounter = 0;
    vi.mocked(d1Client.generateId).mockImplementation((prefix: string) => {
      return `${prefix}-${++idCounter}`;
    });
  });

  describe("createQuestion", () => {
    it("should create a multiple choice question with answer options", async () => {
      const mockQuiz = {
        id: "quiz-123",
        title: "Test Quiz",
        instructor_id: "instructor-123",
      };

      const mockQuestion = {
        id: "question-1",
        quiz_id: "quiz-123",
        question_text: "What is 2+2?",
        question_type: "multiple_choice",
        points: 1,
        order_index: 0,
        created_at: "2025-12-27",
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuiz) // getQuizById
        .mockResolvedValueOnce({ count: 0 }) // question count
        .mockResolvedValueOnce(mockQuestion); // getQuestionById

      vi.mocked(d1Client.executeMutation).mockResolvedValue({
        success: true,
        meta: {} as Record<string, unknown>,
      });

      const result = await createQuestion({
        quizId: "quiz-123",
        questionText: "What is 2+2?",
        questionType: "multiple_choice",
        points: 1,
        answerOptions: [
          { optionText: "3", isCorrect: false, orderIndex: 0 },
          { optionText: "4", isCorrect: true, orderIndex: 1 },
          { optionText: "5", isCorrect: false, orderIndex: 2 },
        ],
      });

      expect(result.question_text).toBe("What is 2+2?");
      expect(result.answer_options).toHaveLength(3);
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO questions"),
        expect.arrayContaining(["question-1", "quiz-123", "What is 2+2?", "multiple_choice", 1, 0])
      );
    });

    it("should create a true/false question with correct answer", async () => {
      const mockQuiz = {
        id: "quiz-123",
        title: "Test Quiz",
        instructor_id: "instructor-123",
      };

      const mockQuestion = {
        id: "question-1",
        quiz_id: "quiz-123",
        question_text: "The sky is blue",
        question_type: "true_false",
        points: 1,
        order_index: 0,
        created_at: "2025-12-27",
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuiz)
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce(mockQuestion);

      vi.mocked(d1Client.executeMutation).mockResolvedValue({
        success: true,
        meta: {} as Record<string, unknown>,
      });

      const result = await createQuestion({
        quizId: "quiz-123",
        questionText: "The sky is blue",
        questionType: "true_false",
        points: 1,
        correctAnswer: true,
      });

      expect(result.question_type).toBe("true_false");
      expect(result.answer_options).toHaveLength(2);
      
      // Check that True option is marked correct
      const trueOption = result.answer_options.find((opt) => opt.option_text === "True");
      expect(trueOption?.is_correct).toBe(1);
    });

    it("should create a short answer question with metadata", async () => {
      const mockQuiz = {
        id: "quiz-123",
        title: "Test Quiz",
        instructor_id: "instructor-123",
      };

      const mockQuestion = {
        id: "question-1",
        quiz_id: "quiz-123",
        question_text: "Explain photosynthesis",
        question_type: "short_answer",
        points: 5,
        order_index: 0,
        created_at: "2025-12-27",
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuiz)
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce(mockQuestion);

      vi.mocked(d1Client.executeMutation).mockResolvedValue({
        success: true,
        meta: {} as Record<string, unknown>,
      });

      const result = await createQuestion({
        quizId: "quiz-123",
        questionText: "Explain photosynthesis",
        questionType: "short_answer",
        points: 5,
        sampleAnswer: "Photosynthesis is the process...",
        answerGuidelines: "Look for mention of chlorophyll and sunlight",
      });

      expect(result.question_type).toBe("short_answer");
      expect(result.answer_options).toHaveLength(1);
      
      // Check metadata is stored
      const metadata = JSON.parse(result.answer_options[0].option_text);
      expect(metadata.sampleAnswer).toBe("Photosynthesis is the process...");
      expect(metadata.answerGuidelines).toBe("Look for mention of chlorophyll and sunlight");
    });

    it("should throw error if quiz not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      await expect(
        createQuestion({
          quizId: "invalid-quiz",
          questionText: "Test question",
          questionType: "multiple_choice",
        })
      ).rejects.toThrow("Quiz not found");
    });

    it("should auto-increment order_index when not provided", async () => {
      const mockQuiz = {
        id: "quiz-123",
        title: "Test Quiz",
        instructor_id: "instructor-123",
      };

      const mockQuestion = {
        id: "question-1",
        quiz_id: "quiz-123",
        question_text: "Test",
        question_type: "multiple_choice",
        points: 1,
        order_index: 5,
        created_at: "2025-12-27",
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuiz)
        .mockResolvedValueOnce({ count: 5 }) // 5 existing questions
        .mockResolvedValueOnce(mockQuestion);

      vi.mocked(d1Client.executeMutation).mockResolvedValue({
        success: true,
        meta: {} as Record<string, unknown>,
      });

      await createQuestion({
        quizId: "quiz-123",
        questionText: "Test",
        questionType: "multiple_choice",
        answerOptions: [
          { optionText: "A", isCorrect: true, orderIndex: 0 },
          { optionText: "B", isCorrect: false, orderIndex: 1 },
        ],
      });

      // Should use count (5) as order_index
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO questions"),
        expect.arrayContaining([expect.any(String), "quiz-123", "Test", "multiple_choice", 1, 5])
      );
    });
  });

  describe("getQuestionById", () => {
    it("should retrieve a question by ID", async () => {
      const mockQuestion = {
        id: "question-123",
        quiz_id: "quiz-123",
        question_text: "Test question",
        question_type: "multiple_choice",
        points: 1,
        order_index: 0,
        created_at: "2025-12-27",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuestion);

      const result = await getQuestionById("question-123");

      expect(result).toEqual(mockQuestion);
      expect(d1Client.executeQueryFirst).toHaveBeenCalledWith(
        "SELECT * FROM questions WHERE id = ?",
        ["question-123"]
      );
    });

    it("should return null if question not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      const result = await getQuestionById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getQuestionWithOptions", () => {
    it("should retrieve a question with its answer options", async () => {
      const mockQuestion = {
        id: "question-123",
        quiz_id: "quiz-123",
        question_text: "What is 2+2?",
        question_type: "multiple_choice",
        points: 1,
        order_index: 0,
        created_at: "2025-12-27",
      };

      const mockOptions = [
        {
          id: "option-1",
          question_id: "question-123",
          option_text: "3",
          is_correct: 0,
          order_index: 0,
        },
        {
          id: "option-2",
          question_id: "question-123",
          option_text: "4",
          is_correct: 1,
          order_index: 1,
        },
      ];

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuestion);
      vi.mocked(d1Client.executeQuery).mockResolvedValueOnce(mockOptions);

      const result = await getQuestionWithOptions("question-123");

      expect(result?.answer_options).toHaveLength(2);
      expect(result?.answer_options[1].is_correct).toBe(1);
    });

    it("should return null if question not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      const result = await getQuestionWithOptions("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getQuestionsByQuiz", () => {
    it("should retrieve all questions for a quiz with options", async () => {
      const mockQuestions = [
        {
          id: "question-1",
          quiz_id: "quiz-123",
          question_text: "Question 1",
          question_type: "multiple_choice",
          points: 1,
          order_index: 0,
          created_at: "2025-12-27",
        },
        {
          id: "question-2",
          quiz_id: "quiz-123",
          question_text: "Question 2",
          question_type: "true_false",
          points: 1,
          order_index: 1,
          created_at: "2025-12-27",
        },
      ];

      const mockOptions1 = [
        {
          id: "option-1",
          question_id: "question-1",
          option_text: "A",
          is_correct: 1,
          order_index: 0,
        },
      ];

      const mockOptions2 = [
        {
          id: "option-2",
          question_id: "question-2",
          option_text: "True",
          is_correct: 1,
          order_index: 0,
        },
        {
          id: "option-3",
          question_id: "question-2",
          option_text: "False",
          is_correct: 0,
          order_index: 1,
        },
      ];

      vi.mocked(d1Client.executeQuery)
        .mockResolvedValueOnce(mockQuestions)
        .mockResolvedValueOnce(mockOptions1)
        .mockResolvedValueOnce(mockOptions2);

      const result = await getQuestionsByQuiz("quiz-123");

      expect(result).toHaveLength(2);
      expect(result[0].answer_options).toHaveLength(1);
      expect(result[1].answer_options).toHaveLength(2);
    });

    it("should return empty array for quiz with no questions", async () => {
      vi.mocked(d1Client.executeQuery).mockResolvedValueOnce([]);

      const result = await getQuestionsByQuiz("quiz-123");

      expect(result).toEqual([]);
    });
  });

  describe("updateQuestion", () => {
    it("should update question text and points", async () => {
      const mockQuestion = {
        id: "question-123",
        quiz_id: "quiz-123",
        question_text: "Old text",
        question_type: "multiple_choice",
        points: 1,
        order_index: 0,
        created_at: "2025-12-27",
      };

      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "instructor-123",
      };

      const updatedQuestion = {
        ...mockQuestion,
        question_text: "New text",
        points: 5,
      };

      const mockOptions = [
        {
          id: "option-1",
          question_id: "question-123",
          option_text: "A",
          is_correct: 1,
          order_index: 0,
        },
      ];

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuestion) // getQuestionById
        .mockResolvedValueOnce(mockQuiz) // getQuizById
        .mockResolvedValueOnce(updatedQuestion); // updated question

      vi.mocked(d1Client.executeQuery).mockResolvedValueOnce(mockOptions);

      vi.mocked(d1Client.executeMutation).mockResolvedValue({
        success: true,
        meta: {} as Record<string, unknown>,
      });

      const result = await updateQuestion("question-123", "instructor-123", {
        questionText: "New text",
        points: 5,
      });

      expect(result.question_text).toBe("New text");
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE questions"),
        expect.arrayContaining(["New text", 5, "question-123"])
      );
    });

    it("should update multiple choice answer options", async () => {
      const mockQuestion = {
        id: "question-123",
        quiz_id: "quiz-123",
        question_text: "Test",
        question_type: "multiple_choice",
        points: 1,
        order_index: 0,
        created_at: "2025-12-27",
      };

      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "instructor-123",
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuestion)
        .mockResolvedValueOnce(mockQuiz)
        .mockResolvedValueOnce(mockQuestion);

      vi.mocked(d1Client.executeQuery).mockResolvedValueOnce([]);

      vi.mocked(d1Client.executeMutation).mockResolvedValue({
        success: true,
        meta: {} as Record<string, unknown>,
      });

      await updateQuestion("question-123", "instructor-123", {
        answerOptions: [
          { optionText: "New A", isCorrect: true, orderIndex: 0 },
          { optionText: "New B", isCorrect: false, orderIndex: 1 },
        ],
      });

      // Should delete old options
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        "DELETE FROM answer_options WHERE question_id = ?",
        ["question-123"]
      );

      // Should insert new options
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO answer_options"),
        expect.arrayContaining([expect.any(String), "question-123", "New A", 1, 0])
      );
    });

    it("should throw error if user does not own quiz", async () => {
      const mockQuestion = {
        id: "question-123",
        quiz_id: "quiz-123",
        question_type: "multiple_choice",
      };

      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "other-instructor",
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuestion)
        .mockResolvedValueOnce(mockQuiz);

      await expect(
        updateQuestion("question-123", "instructor-123", {
          questionText: "Updated",
        })
      ).rejects.toThrow("You do not have permission");
    });
  });

  describe("deleteQuestion", () => {
    it("should delete a question and reorder remaining questions", async () => {
      const mockQuestion = {
        id: "question-123",
        quiz_id: "quiz-123",
        order_index: 1,
      };

      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "instructor-123",
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuestion)
        .mockResolvedValueOnce(mockQuiz);

      vi.mocked(d1Client.executeMutation).mockResolvedValue({
        success: true,
        meta: {} as Record<string, unknown>,
      });

      await deleteQuestion("question-123", "instructor-123");

      // Should delete the question
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        "DELETE FROM questions WHERE id = ?",
        ["question-123"]
      );

      // Should reorder remaining questions
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE questions"),
        ["quiz-123", 1]
      );
    });

    it("should throw error if question not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      await expect(deleteQuestion("nonexistent", "instructor-123")).rejects.toThrow(
        "Question not found"
      );
    });
  });

  describe("reorderQuestions", () => {
    it("should update order_index for multiple questions", async () => {
      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "instructor-123",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuiz);

      vi.mocked(d1Client.executeMutation).mockResolvedValue({
        success: true,
        meta: {} as Record<string, unknown>,
      });

      await reorderQuestions("quiz-123", "instructor-123", [
        { questionId: "question-1", orderIndex: 2 },
        { questionId: "question-2", orderIndex: 0 },
        { questionId: "question-3", orderIndex: 1 },
      ]);

      expect(d1Client.executeMutation).toHaveBeenCalledTimes(3);
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        "UPDATE questions SET order_index = ? WHERE id = ? AND quiz_id = ?",
        [2, "question-1", "quiz-123"]
      );
    });

    it("should throw error if user does not own quiz", async () => {
      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "other-instructor",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuiz);

      await expect(
        reorderQuestions("quiz-123", "instructor-123", [
          { questionId: "question-1", orderIndex: 0 },
        ])
      ).rejects.toThrow("You do not have permission");
    });
  });
});

