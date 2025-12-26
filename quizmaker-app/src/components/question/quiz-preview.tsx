/**
 * Quiz Preview Component
 * Shows a preview of how the quiz will appear to students
 */

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface AnswerOption {
  id: string;
  option_text: string;
  is_correct: number;
  order_index: number;
}

interface Question {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  points: number;
  order_index: number;
  answer_options: AnswerOption[];
}

interface QuizPreviewProps {
  quizTitle: string;
  quizDescription: string | null;
  questions: Question[];
  totalPoints: number;
  durationMinutes?: number | null;
  passingScore?: number | null;
}

export function QuizPreview({
  quizTitle,
  quizDescription,
  questions,
  totalPoints,
  durationMinutes,
  passingScore,
}: QuizPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setCurrentQuestionIndex(0);
    setShowAnswers(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentQuestionIndex(0);
    setShowAnswers(false);
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className="gap-2"
        size="lg"
      >
        <Eye className="h-5 w-5" />
        Preview Quiz
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{quizTitle}</DialogTitle>
                {quizDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{quizDescription}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* Quiz Info */}
          <div className="flex flex-wrap gap-3 py-4 border-y border-gray-200 dark:border-gray-700">
            <Badge variant="secondary" className="text-sm">
              {questions.length} {questions.length === 1 ? "Question" : "Questions"}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Total Points: {totalPoints}
            </Badge>
            {durationMinutes && (
              <Badge variant="secondary" className="text-sm">
                Time Limit: {durationMinutes} minutes
              </Badge>
            )}
            {passingScore && (
              <Badge variant="secondary" className="text-sm">
                Passing Score: {passingScore}%
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
              className="ml-auto"
            >
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </Button>
          </div>

          {/* Question Display */}
          <div className="space-y-6 py-6">
            {/* Question Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <Badge variant="outline">{currentQuestion.points} points</Badge>
            </div>

            {/* Question Text */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {currentQuestion.question_text}
                </p>
              </CardContent>
            </Card>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.question_type === "multiple_choice" && (
                <>
                  {currentQuestion.answer_options
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((option, index) => (
                      <Card
                        key={option.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          showAnswers && option.is_correct
                            ? "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                                showAnswers && option.is_correct
                                  ? "border-green-600 bg-green-600"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {showAnswers && option.is_correct && (
                                <div className="w-2 h-2 rounded-full bg-white m-auto mt-[3px]" />
                              )}
                            </div>
                            <span className="text-base">{option.option_text}</span>
                            {showAnswers && option.is_correct && (
                              <Badge className="ml-auto bg-green-600">Correct</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </>
              )}

              {currentQuestion.question_type === "true_false" && (
                <>
                  {currentQuestion.answer_options
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((option) => (
                      <Card
                        key={option.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          showAnswers && option.is_correct
                            ? "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                                showAnswers && option.is_correct
                                  ? "border-green-600 bg-green-600"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                            >
                              {showAnswers && option.is_correct && (
                                <div className="w-2 h-2 rounded-full bg-white m-auto mt-[3px]" />
                              )}
                            </div>
                            <span className="text-lg font-semibold">{option.option_text}</span>
                            {showAnswers && option.is_correct && (
                              <Badge className="ml-auto bg-green-600">Correct</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </>
              )}

              {currentQuestion.question_type === "short_answer" && (
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <textarea
                        className="w-full min-h-[150px] p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                        placeholder="Type your answer here..."
                        disabled
                      />
                      {showAnswers && currentQuestion.answer_options.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                            Sample Answer (for instructor reference):
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {(() => {
                              try {
                                const metadata = JSON.parse(
                                  currentQuestion.answer_options[0].option_text
                                );
                                return metadata.sampleAnswer || "No sample answer provided";
                              } catch {
                                return "No sample answer provided";
                              }
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Student View Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>📝 Preview Mode:</strong> This is how students will see the quiz. The "Show
              Answers" toggle is only visible to you as the instructor.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

