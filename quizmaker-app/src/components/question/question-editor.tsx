/**
 * Question Editor Component
 * Main component for creating and editing questions with type selection
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultipleChoiceEditor } from "./multiple-choice-editor";
import { TrueFalseEditor } from "./true-false-editor";
import { ShortAnswerEditor } from "./short-answer-editor";
import { X, Save } from "lucide-react";

type QuestionType = "multiple_choice" | "true_false" | "short_answer";

interface QuestionData {
  id?: string;
  questionText: string;
  questionType: QuestionType;
  points: number;
  orderIndex: number;
  // Multiple choice
  answerOptions?: Array<{
    id?: string;
    optionText: string;
    isCorrect: boolean;
    orderIndex: number;
  }>;
  // True/false
  correctAnswer?: boolean;
  // Short answer
  sampleAnswer?: string;
  answerGuidelines?: string;
}

interface QuestionEditorProps {
  question?: QuestionData;
  orderIndex: number;
  onSave: (question: QuestionData) => void;
  onCancel: () => void;
  isNew?: boolean;
}

export function QuestionEditor({
  question,
  orderIndex,
  onSave,
  onCancel,
  isNew = false,
}: QuestionEditorProps) {
  const [questionText, setQuestionText] = useState(question?.questionText || "");
  const [questionType, setQuestionType] = useState<QuestionType>(
    question?.questionType || "multiple_choice"
  );
  const [points, setPoints] = useState(question?.points || 1);
  
  // Multiple choice state
  const [answerOptions, setAnswerOptions] = useState(question?.answerOptions || []);
  
  // True/false state
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer);
  
  // Short answer state
  const [sampleAnswer, setSampleAnswer] = useState(question?.sampleAnswer || "");
  const [answerGuidelines, setAnswerGuidelines] = useState(question?.answerGuidelines || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleQuestionTypeChange = (value: string) => {
    setQuestionType(value as QuestionType);
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!questionText.trim()) {
      newErrors.questionText = "Question text is required";
    }

    if (points < 1 || points > 100) {
      newErrors.points = "Points must be between 1 and 100";
    }

    if (questionType === "multiple_choice") {
      if (!answerOptions || answerOptions.length < 2) {
        newErrors.answerOptions = "At least 2 answer options are required";
      } else if (!answerOptions.some((opt) => opt.isCorrect)) {
        newErrors.answerOptions = "At least one option must be marked as correct";
      } else if (answerOptions.some((opt) => !opt.optionText.trim())) {
        newErrors.answerOptions = "All options must have text";
      }
    }

    if (questionType === "true_false" && correctAnswer === undefined) {
      newErrors.correctAnswer = "You must select the correct answer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);

    const questionData: QuestionData = {
      id: question?.id,
      questionText: questionText.trim(),
      questionType,
      points,
      orderIndex,
    };

    if (questionType === "multiple_choice") {
      questionData.answerOptions = answerOptions;
    } else if (questionType === "true_false") {
      questionData.correctAnswer = correctAnswer;
    } else if (questionType === "short_answer") {
      questionData.sampleAnswer = sampleAnswer;
      questionData.answerGuidelines = answerGuidelines;
    }

    try {
      await onSave(questionData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-lg border-2 border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isNew ? "Add New Question" : "Edit Question"}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Question #{orderIndex + 1}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Question Type Selector */}
      <div className="space-y-2">
        <Label htmlFor="question-type" className="text-base font-semibold">
          Question Type
        </Label>
        <Select value={questionType} onValueChange={handleQuestionTypeChange}>
          <SelectTrigger id="question-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="true_false">True/False</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="question-text" className="text-base font-semibold">
          Question Text <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="question-text"
          placeholder="Enter your question here..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
          maxLength={1000}
          className={`resize-none ${errors.questionText ? "border-red-500" : ""}`}
        />
        {errors.questionText && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.questionText}</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {questionText.length}/1000 characters
        </p>
      </div>

      {/* Points */}
      <div className="space-y-2">
        <Label htmlFor="points" className="text-base font-semibold">
          Points <span className="text-red-500">*</span>
        </Label>
        <Input
          id="points"
          type="number"
          min={1}
          max={100}
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
          className={`w-32 ${errors.points ? "border-red-500" : ""}`}
        />
        {errors.points && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.points}</p>
        )}
      </div>

      {/* Question Type Specific Editors */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        {questionType === "multiple_choice" && (
          <MultipleChoiceEditor
            answerOptions={answerOptions}
            onChange={setAnswerOptions}
            error={errors.answerOptions}
          />
        )}

        {questionType === "true_false" && (
          <TrueFalseEditor
            correctAnswer={correctAnswer}
            onChange={setCorrectAnswer}
            error={errors.correctAnswer}
          />
        )}

        {questionType === "short_answer" && (
          <ShortAnswerEditor
            sampleAnswer={sampleAnswer}
            answerGuidelines={answerGuidelines}
            onChange={(data) => {
              setSampleAnswer(data.sampleAnswer || "");
              setAnswerGuidelines(data.answerGuidelines || "");
            }}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : isNew ? "Add Question" : "Save Changes"}
        </Button>
      </div>
    </Card>
  );
}

