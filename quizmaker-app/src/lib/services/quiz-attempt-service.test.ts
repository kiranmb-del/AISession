/**
 * Quiz Attempt Service Tests
 * Unit tests for quiz attempt service functions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createQuizAttempt,
  getAttemptById,
  getAttemptWithDetails,
  getAttemptsByStudent,
  getActiveAttempt,
  getAttemptsByQuiz,
  completeAttempt,
  abandonAttempt,
  getStudentStats,
} from "./quiz-attempt-service";
import * as d1Client from "../d1-client";

// Mock server-only module
vi.mock("server-only", () => ({}));

// Mock D1 client
vi.mock("../d1-client", () => ({
  executeQuery: vi.fn(),
  executeQueryFirst: vi.fn(),
  executeMutation: vi.fn(),
  generateId: vi.fn(() => "test-attempt-id"),
}));

describe("Quiz Attempt Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createQuizAttempt", () => {
    it("should create a new quiz attempt", async () => {
      const mockAttempt = {
        id: "test-attempt-id",
        quiz_id: "quiz-123",
        student_id: "student-123",
        started_at: "2025-12-28T00:00:00Z",
        completed_at: null,
        score: null,
        total_points: null,
        status: "in_progress" as const,
      };

      // Mock no existing attempt
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);
      
      // Mock successful insert
      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });

      // Mock fetching the created attempt
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockAttempt);

      const result = await createQuizAttempt({
        quiz_id: "quiz-123",
        student_id: "student-123",
      });

      expect(result).toEqual(mockAttempt);
      expect(d1Client.executeMutation).toHaveBeenCalled();
    });

    it("should throw error if active attempt already exists", async () => {
      const existingAttempt = {
        id: "existing-attempt",
        quiz_id: "quiz-123",
        student_id: "student-123",
        status: "in_progress",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(existingAttempt);

      await expect(
        createQuizAttempt({
          quiz_id: "quiz-123",
          student_id: "student-123",
        })
      ).rejects.toThrow("already have an in-progress attempt");
    });

    it("should throw error if attempt creation fails", async () => {
      // Mock no existing attempt
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);
      
      // Mock successful insert
      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });

      // Mock failed fetch (attempt not found after creation)
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      await expect(
        createQuizAttempt({
          quiz_id: "quiz-123",
          student_id: "student-123",
        })
      ).rejects.toThrow("Failed to create quiz attempt");
    });
  });

  describe("getAttemptById", () => {
    it("should return attempt by id", async () => {
      const mockAttempt = {
        id: "attempt-123",
        quiz_id: "quiz-123",
        student_id: "student-123",
        status: "in_progress",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockAttempt);

      const result = await getAttemptById("attempt-123");

      expect(result).toEqual(mockAttempt);
      expect(d1Client.executeQueryFirst).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM quiz_attempts"),
        ["attempt-123"]
      );
    });

    it("should return null if attempt not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      const result = await getAttemptById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getAttemptWithDetails", () => {
    it("should return attempt with quiz and instructor details", async () => {
      const mockAttemptWithDetails = {
        id: "attempt-123",
        quiz_id: "quiz-123",
        student_id: "student-123",
        status: "completed",
        quiz_title: "Math Quiz",
        quiz_description: "Test your math skills",
        instructor_name: "John Doe",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(
        mockAttemptWithDetails
      );

      const result = await getAttemptWithDetails("attempt-123");

      expect(result).toEqual(mockAttemptWithDetails);
      expect(d1Client.executeQueryFirst).toHaveBeenCalledWith(
        expect.stringContaining("JOIN quizzes q"),
        ["attempt-123"]
      );
    });
  });

  describe("getAttemptsByStudent", () => {
    it("should return all attempts for a student", async () => {
      const mockAttempts = [
        {
          id: "attempt-1",
          quiz_id: "quiz-1",
          student_id: "student-123",
          quiz_title: "Quiz 1",
        },
        {
          id: "attempt-2",
          quiz_id: "quiz-2",
          student_id: "student-123",
          quiz_title: "Quiz 2",
        },
      ];

      vi.mocked(d1Client.executeQuery).mockResolvedValueOnce(mockAttempts);

      const result = await getAttemptsByStudent("student-123");

      expect(result).toEqual(mockAttempts);
      expect(d1Client.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE qa.student_id = ?"),
        ["student-123"]
      );
    });
  });

  describe("getActiveAttempt", () => {
    it("should return active attempt for quiz and student", async () => {
      const mockAttempt = {
        id: "attempt-123",
        quiz_id: "quiz-123",
        student_id: "student-123",
        status: "in_progress",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockAttempt);

      const result = await getActiveAttempt("quiz-123", "student-123");

      expect(result).toEqual(mockAttempt);
      expect(d1Client.executeQueryFirst).toHaveBeenCalledWith(
        expect.stringContaining("status = 'in_progress'"),
        ["quiz-123", "student-123"]
      );
    });

    it("should return null if no active attempt", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      const result = await getActiveAttempt("quiz-123", "student-123");

      expect(result).toBeNull();
    });
  });

  describe("getAttemptsByQuiz", () => {
    it("should return all attempts for a quiz by student", async () => {
      const mockAttempts = [
        {
          id: "attempt-1",
          quiz_id: "quiz-123",
          student_id: "student-123",
          status: "completed",
        },
        {
          id: "attempt-2",
          quiz_id: "quiz-123",
          student_id: "student-123",
          status: "in_progress",
        },
      ];

      vi.mocked(d1Client.executeQuery).mockResolvedValueOnce(mockAttempts);

      const result = await getAttemptsByQuiz("quiz-123", "student-123");

      expect(result).toEqual(mockAttempts);
      expect(d1Client.executeQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE quiz_id = ?"),
        ["quiz-123", "student-123"]
      );
    });
  });

  describe("completeAttempt", () => {
    it("should complete an in-progress attempt", async () => {
      const mockAttempt = {
        id: "attempt-123",
        status: "in_progress",
      };

      const completedAttempt = {
        ...mockAttempt,
        status: "completed",
        score: 80,
        total_points: 100,
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockAttempt)
        .mockResolvedValueOnce(completedAttempt);

      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });

      const result = await completeAttempt("attempt-123", 80, 100);

      expect(result.status).toBe("completed");
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("status = 'completed'"),
        [80, 100, "attempt-123"]
      );
    });

    it("should throw error if attempt not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      await expect(completeAttempt("nonexistent", 80, 100)).rejects.toThrow(
        "Quiz attempt not found"
      );
    });

    it("should throw error if attempt is not in progress", async () => {
      const mockAttempt = {
        id: "attempt-123",
        status: "completed",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockAttempt);

      await expect(completeAttempt("attempt-123", 80, 100)).rejects.toThrow(
        "not in progress"
      );
    });
  });

  describe("abandonAttempt", () => {
    it("should abandon an in-progress attempt", async () => {
      const mockAttempt = {
        id: "attempt-123",
        status: "in_progress",
      };

      const abandonedAttempt = {
        ...mockAttempt,
        status: "abandoned",
      };

      vi.mocked(d1Client.executeQueryFirst)
        .mockResolvedValueOnce(mockAttempt)
        .mockResolvedValueOnce(abandonedAttempt);

      vi.mocked(d1Client.executeMutation).mockResolvedValueOnce({
        success: true,
        meta: {} as any,
      });

      const result = await abandonAttempt("attempt-123");

      expect(result.status).toBe("abandoned");
      expect(d1Client.executeMutation).toHaveBeenCalledWith(
        expect.stringContaining("status = 'abandoned'"),
        ["attempt-123"]
      );
    });

    it("should throw error if attempt not found", async () => {
      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(null);

      await expect(abandonAttempt("nonexistent")).rejects.toThrow(
        "Quiz attempt not found"
      );
    });

    it("should throw error if attempt is not in progress", async () => {
      const mockAttempt = {
        id: "attempt-123",
        status: "completed",
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockAttempt);

      await expect(abandonAttempt("attempt-123")).rejects.toThrow(
        "not in progress"
      );
    });
  });

  describe("getStudentStats", () => {
    it("should return student statistics", async () => {
      const mockStats = {
        total_attempts: 10,
        completed_attempts: 8,
        average_score_percentage: 85.5,
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockStats);

      const result = await getStudentStats("student-123");

      expect(result).toEqual(mockStats);
      expect(d1Client.executeQueryFirst).toHaveBeenCalledWith(
        expect.stringContaining("COUNT(*)"),
        ["student-123"]
      );
    });

    it("should handle no attempts", async () => {
      const mockStats = {
        total_attempts: 0,
        completed_attempts: 0,
        average_score_percentage: null,
      };

      vi.mocked(d1Client.executeQueryFirst).mockResolvedValueOnce(mockStats);

      const result = await getStudentStats("student-123");

      expect(result?.total_attempts).toBe(0);
      expect(result?.average_score_percentage).toBeNull();
    });
  });
});

