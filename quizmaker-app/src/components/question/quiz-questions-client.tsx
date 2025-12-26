/**
 * Quiz Questions Management Page
 * Allows instructors to add, edit, delete, and reorder questions in a quiz
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionEditor } from "@/components/question/question-editor";
import { QuizPreview } from "@/components/question/quiz-preview";
import { toast } from "sonner";
import {
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Eye,
  Save,
  ArrowLeft,
} from "lucide-react";

interface AnswerOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: number;
  order_index: number;
}

interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  points: number;
  order_index: number;
  created_at: string;
  answer_options: AnswerOption[];
}

interface QuizQuestionsClientProps {
  quizId: string;
  quizTitle: string;
  quizDescription: string | null;
  durationMinutes?: number | null;
  passingScore?: number | null;
}

export function QuizQuestionsClient({
  quizId,
  quizTitle,
  quizDescription,
  durationMinutes,
  passingScore,
}: QuizQuestionsClientProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/quizzes/${quizId}/questions`);

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveQuestion = async (questionData: any) => {
    try {
      const isUpdate = !!questionData.id;
      const url = isUpdate
        ? `/api/quizzes/${quizId}/questions/${questionData.id}`
        : `/api/quizzes/${quizId}/questions`;

      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save question");
      }

      toast.success(isUpdate ? "Question updated successfully" : "Question added successfully");

      // Refresh questions list
      await fetchQuestions();

      // Close editor
      setEditingQuestionId(null);
      setIsAddingNew(false);
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      toast.success("Question deleted successfully");
      await fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedIndex];

    // Remove from old position
    newQuestions.splice(draggedIndex, 1);

    // Insert at new position
    newQuestions.splice(index, 0, draggedQuestion);

    // Update order_index
    newQuestions.forEach((q, i) => {
      q.order_index = i;
    });

    setQuestions(newQuestions);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      const questionOrders = questions.map((q) => ({
        questionId: q.id,
        orderIndex: q.order_index,
      }));

      const response = await fetch(`/api/quizzes/${quizId}/questions/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionOrders }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder questions");
      }

      toast.success("Questions reordered successfully");
    } catch (error) {
      console.error("Error reordering questions:", error);
      toast.error("Failed to reorder questions");
      await fetchQuestions(); // Refresh to restore original order
    } finally {
      setDraggedIndex(null);
    }
  };

  const convertQuestionForEditor = (question: Question) => {
    const baseData = {
      id: question.id,
      questionText: question.question_text,
      questionType: question.question_type,
      points: question.points,
      orderIndex: question.order_index,
    };

    if (question.question_type === "multiple_choice") {
      return {
        ...baseData,
        answerOptions: question.answer_options.map((opt) => ({
          id: opt.id,
          optionText: opt.option_text,
          isCorrect: opt.is_correct === 1,
          orderIndex: opt.order_index,
        })),
      };
    } else if (question.question_type === "true_false") {
      const trueOption = question.answer_options.find((opt) => opt.option_text === "True");
      return {
        ...baseData,
        correctAnswer: trueOption?.is_correct === 1,
      };
    } else if (question.question_type === "short_answer") {
      const metadata = question.answer_options[0]?.option_text;
      let parsed = { sampleAnswer: null, answerGuidelines: null };

      if (metadata) {
        try {
          parsed = JSON.parse(metadata);
        } catch (e) {
          // Ignore parse errors
        }
      }

      return {
        ...baseData,
        sampleAnswer: parsed.sampleAnswer || "",
        answerGuidelines: parsed.answerGuidelines || "",
      };
    }

    return baseData;
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "true_false":
        return "True/False";
      case "short_answer":
        return "Short Answer";
      default:
        return type;
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "true_false":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "short_answer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {quizTitle}
              </h2>
              {quizDescription && (
                <p className="text-gray-600 dark:text-gray-400">{quizDescription}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="text-sm">
                  {questions.length} {questions.length === 1 ? "Question" : "Questions"}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {questions.length > 0 && (
                <QuizPreview
                  quizTitle={quizTitle}
                  quizDescription={quizDescription}
                  questions={questions}
                  totalPoints={questions.reduce((sum, q) => sum + q.points, 0)}
                  durationMinutes={durationMinutes}
                  passingScore={passingScore}
                />
              )}
              <Button
                onClick={() => router.push(`/dashboard/quizzes/${quizId}`)}
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Button */}
      {!isAddingNew && !editingQuestionId && (
        <Button
          onClick={() => setIsAddingNew(true)}
          className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Add New Question
        </Button>
      )}

      {/* New Question Editor */}
      {isAddingNew && (
        <QuestionEditor
          orderIndex={questions.length}
          onSave={handleSaveQuestion}
          onCancel={() => setIsAddingNew(false)}
          isNew
        />
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id}>
            {editingQuestionId === question.id ? (
              <QuestionEditor
                question={convertQuestionForEditor(question)}
                orderIndex={question.order_index}
                onSave={handleSaveQuestion}
                onCancel={() => setEditingQuestionId(null)}
              />
            ) : (
              <Card
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`transition-all hover:shadow-lg cursor-move ${
                  draggedIndex === index ? "opacity-50" : ""
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="flex-shrink-0 mt-1">
                      <GripVertical className="h-6 w-6 text-gray-400" />
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Question {index + 1}
                            </Badge>
                            <Badge className={getQuestionTypeColor(question.question_type)}>
                              {getQuestionTypeLabel(question.question_type)}
                            </Badge>
                            <Badge variant="secondary">{question.points} pts</Badge>
                          </div>
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {question.question_text}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingQuestionId(question.id)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Answer Options Preview */}
                      {question.question_type === "multiple_choice" && (
                        <div className="space-y-2 mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          {question.answer_options.map((option) => (
                            <div
                              key={option.id}
                              className={`flex items-center gap-2 text-sm ${
                                option.is_correct
                                  ? "font-semibold text-green-700 dark:text-green-400"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  option.is_correct ? "bg-green-600" : "bg-gray-400"
                                }`}
                              />
                              {option.option_text}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.question_type === "true_false" && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Correct Answer:{" "}
                            <span className="font-semibold text-green-700 dark:text-green-400">
                              {question.answer_options.find((opt) => opt.is_correct === 1)
                                ?.option_text || "N/A"}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {questions.length === 0 && !isAddingNew && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 inline-block mb-4">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No questions yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get started by adding your first question to this quiz.
              </p>
              <Button
                onClick={() => setIsAddingNew(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-5 w-5" />
                Add First Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {questions.length > 0 && !isAddingNew && !editingQuestionId && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>💡 Tip:</strong> Drag and drop questions to reorder them. Students will see
              questions in this order when taking the quiz.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

