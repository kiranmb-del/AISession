/**
 * Multiple Choice Question Editor
 * Component for creating and editing multiple choice questions
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { X, Plus, Check } from "lucide-react";

interface AnswerOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface MultipleChoiceEditorProps {
  answerOptions?: AnswerOption[];
  onChange: (options: AnswerOption[]) => void;
  error?: string;
}

export function MultipleChoiceEditor({
  answerOptions = [],
  onChange,
  error,
}: MultipleChoiceEditorProps) {
  const [options, setOptions] = useState<AnswerOption[]>(
    answerOptions.length > 0
      ? answerOptions
      : [
          { optionText: "", isCorrect: false, orderIndex: 0 },
          { optionText: "", isCorrect: false, orderIndex: 1 },
        ]
  );

  const handleAddOption = () => {
    const newOptions = [
      ...options,
      { optionText: "", isCorrect: false, orderIndex: options.length },
    ];
    setOptions(newOptions);
    onChange(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      return; // Don't allow removing if only 2 options remain
    }
    const newOptions = options
      .filter((_, i) => i !== index)
      .map((opt, i) => ({ ...opt, orderIndex: i }));
    setOptions(newOptions);
    onChange(newOptions);
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].optionText = text;
    setOptions(newOptions);
    onChange(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-semibold">Answer Options</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          disabled={options.length >= 10}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Option
        </Button>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <Card
            key={index}
            className={`p-4 transition-all hover:shadow-md ${
              option.isCorrect
                ? "border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Correct Answer Radio */}
              <button
                type="button"
                onClick={() => handleCorrectChange(index)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  option.isCorrect
                    ? "border-green-600 bg-green-600 dark:border-green-500 dark:bg-green-500"
                    : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                }`}
                title="Mark as correct answer"
              >
                {option.isCorrect && <Check className="h-4 w-4 text-white" />}
              </button>

              {/* Option Text Input */}
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option.optionText}
                  onChange={(e) => handleOptionTextChange(index, e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Remove Button */}
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(index)}
                  className="flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click the circle to mark the correct answer. At least 2 options are required.
      </p>
    </div>
  );
}

