/**
 * Quiz Service Unit Tests
 * Tests for quiz CRUD operations and validation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  createQuiz,
  getQuizById,
  getQuizzesByInstructor,
  getPublishedQuizzes,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  unpublishQuiz,
  canPublishQuiz,
  getQuizStats,
  getQuizQuestionCount,
} from "./quiz-service";
import * as d1Client from "../d1-client";

// Mock the d1-client module
vi.mock("../d1-client", () => ({
  executeQuery: vi.fn(),
  executeQueryFirst: vi.fn(),
  executeMutation: vi.fn(),
  generateId: vi.fn(() => "test-quiz-id"),
}));

// Mock server-only
vi.mock("server-only", () => ({}));

describe("Quiz Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createQuiz", () => {
    it("should create a quiz with valid data", async () => {
      const mockInstructor = { id: "instructor-123", user_type: "instructor" };
      const mockQuiz = {
        id: "test-quiz-id",
        title: "Test Quiz",
        description: "Test Description",
        instructor_id: "instructor-123",
        duration_minutes: 30,
        passing_score: 70,
        is_published: 0,
        created_at: "2025-12-26",
        updated_at: "2025-12-26",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockInstructor);
      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuiz);

      const result = await createQuiz({
        title: "Test Quiz",
        description: "Test Description",
        instructorId: "instructor-123",
        durationMinutes: 30,
        passingScore: 70,
      });

      expect(result).toEqual(mockQuiz);
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO quizzes"),
        expect.arrayContaining([
          "test-quiz-id",
          "Test Quiz",
          "Test Description",
          "instructor-123",
          30,
          70,
        ])
      );
    });

    it("should throw error if instructor is invalid", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      await expect(
        createQuiz({
          title: "Test Quiz",
          instructorId: "invalid-instructor",
        })
      ).rejects.toThrow("Invalid instructor ID");
    });

    it("should handle optional fields", async () => {
      const mockInstructor = { id: "instructor-123", user_type: "instructor" };
      const mockQuiz = {
        id: "test-quiz-id",
        title: "Test Quiz",
        description: null,
        instructor_id: "instructor-123",
        duration_minutes: null,
        passing_score: null,
        is_published: 0,
        created_at: "2025-12-26",
        updated_at: "2025-12-26",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockInstructor);
      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuiz);

      const result = await createQuiz({
        title: "Test Quiz",
        instructorId: "instructor-123",
      });

      expect(result.description).toBeNull();
      expect(result.duration_minutes).toBeNull();
      expect(result.passing_score).toBeNull();
    });
  });

  describe("getQuizById", () => {
    it("should return quiz by ID", async () => {
      const mockQuiz = {
        id: "quiz-123",
        title: "Test Quiz",
        description: null,
        instructor_id: "instructor-123",
        duration_minutes: 30,
        passing_score: 70,
        is_published: 0,
        created_at: "2025-12-26",
        updated_at: "2025-12-26",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuiz);

      const result = await getQuizById("quiz-123");

      expect(result).toEqual(mockQuiz);
      expect(d1Client.executeQueryFirst).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM quizzes WHERE id = ?"),
        ["quiz-123"]
      );
    });

    it("should return null if quiz not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      const result = await getQuizById("nonexistent-quiz");

      expect(result).toBeNull();
    });
  });

  describe("getQuizzesByInstructor", () => {
    it("should return all quizzes for an instructor", async () => {
      const mockQuizzes = [
        {
          id: "quiz-1",
          title: "Quiz 1",
          instructor_id: "instructor-123",
          is_published: 1,
          created_at: "2025-12-26",
        },
        {
          id: "quiz-2",
          title: "Quiz 2",
          instructor_id: "instructor-123",
          is_published: 0,
          created_at: "2025-12-25",
        },
      ];

      vi.mocked(d1Client.executeQuery).mockResolvedValueOnce(mockQuizzes);

      const result = await getQuizzesByInstructor("instructor-123");

      expect(result).toEqual(mockQuizzes);
      expect(d1Client.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE instructor_id = ?"),
        ["instructor-123"]
      );
    });
  });

  describe("getPublishedQuizzes", () => {
    it("should return only published quizzes", async () => {
      const mockQuizzes = [
        {
          id: "quiz-1",
          title: "Published Quiz",
          is_published: 1,
          instructor_name: "John Doe",
        },
      ];

      vi.mocked(d1Client.executeQuery).mockResolvedValueOnce(mockQuizzes);

      const result = await getPublishedQuizzes();

      expect(result).toEqual(mockQuizzes);
      expect(d1Client.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE q.is_published = 1")
      );
    });
  });

  describe("updateQuiz", () => {
    it("should update quiz with valid data", async () => {
      const mockQuiz = {
        id: "quiz-123",
        title: "Original Title",
        instructor_id: "instructor-123",
        is_published: 0,
        created_at: "2025-12-26",
        updated_at: "2025-12-26",
      };

      const updatedQuiz = { ...mockQuiz, title: "Updated Title" };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuiz)
        .mockResolvedValueOnce(updatedQuiz);
      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });

      const result = await updateQuiz("quiz-123", "instructor-123", {
        title: "Updated Title",
      });

      expect(result.title).toBe("Updated Title");
      expect(d1Client.executeMutation).toHaveBeenCalled();
    });

    it("should throw error if quiz not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      await expect(
        updateQuiz("nonexistent-quiz", "instructor-123", { title: "New Title" })
      ).rejects.toThrow("Quiz not found");
    });

    it("should throw error if not the owner", async () => {
      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "different-instructor",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuiz as any);

      await expect(
        updateQuiz("quiz-123", "instructor-123", { title: "New Title" })
      ).rejects.toThrow("You do not have permission");
    });
  });

  describe("publishQuiz", () => {
    it("should publish a quiz", async () => {
      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "instructor-123",
        is_published: 0,
      };

      const publishedQuiz = { ...mockQuiz, is_published: 1 };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuiz as any)
        .mockResolvedValueOnce(publishedQuiz as any);
      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });

      const result = await publishQuiz("quiz-123", "instructor-123");

      expect(result.is_published).toBe(1);
    });
  });

  describe("unpublishQuiz", () => {
    it("should unpublish a quiz", async () => {
      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "instructor-123",
        is_published: 1,
      };

      const unpublishedQuiz = { ...mockQuiz, is_published: 0 };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockQuiz as any)
        .mockResolvedValueOnce(unpublishedQuiz as any);
      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });

      const result = await unpublishQuiz("quiz-123", "instructor-123");

      expect(result.is_published).toBe(0);
    });
  });

  describe("deleteQuiz", () => {
    it("should delete a quiz", async () => {
      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "instructor-123",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuiz as any);
      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });

      await deleteQuiz("quiz-123", "instructor-123");

      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM quizzes WHERE id = ?"),
        ["quiz-123"]
      );
    });

    it("should throw error if not the owner", async () => {
      const mockQuiz = {
        id: "quiz-123",
        instructor_id: "different-instructor",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockQuiz as any);

      await expect(deleteQuiz("quiz-123", "instructor-123")).rejects.toThrow(
        "You do not have permission"
      );
    });
  });

  describe("canPublishQuiz", () => {
    it("should return true if quiz has questions", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce({ count: 5 });

      const result = await canPublishQuiz("quiz-123");

      expect(result.canPublish).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should return false if quiz has no questions", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce({ count: 0 });

      const result = await canPublishQuiz("quiz-123");

      expect(result.canPublish).toBe(false);
      expect(result.reason).toContain("at least one question");
    });
  });

  describe("getQuizQuestionCount", () => {
    it("should return question count", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce({ count: 10 });

      const result = await getQuizQuestionCount("quiz-123");

      expect(result).toBe(10);
    });

    it("should return 0 if no questions", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      const result = await getQuizQuestionCount("quiz-123");

      expect(result).toBe(0);
    });
  });

  describe("getQuizStats", () => {
    it("should return quiz statistics", async () => {
      const mockStats = {
        quiz_id: "quiz-123",
        total_attempts: 10,
        completed_attempts: 8,
        average_score: 75.5,
        pass_rate: 87.5,
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockStats);

      const result = await getQuizStats("quiz-123");

      expect(result).toEqual(mockStats);
      expect(result.total_attempts).toBe(10);
      expect(result.average_score).toBe(75.5);
    });

    it("should return default stats if no attempts", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      const result = await getQuizStats("quiz-123");

      expect(result.total_attempts).toBe(0);
      expect(result.average_score).toBeNull();
      expect(result.pass_rate).toBeNull();
    });
  });
});

