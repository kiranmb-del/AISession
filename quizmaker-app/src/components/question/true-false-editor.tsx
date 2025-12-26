/**
 * True/False Question Editor
 * Component for creating and editing true/false questions
 */

"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface TrueFalseEditorProps {
  correctAnswer?: boolean;
  onChange: (answer: boolean) => void;
  error?: string;
}

export function TrueFalseEditor({
  correctAnswer,
  onChange,
  error,
}: TrueFalseEditorProps) {
  const [selected, setSelected] = useState<boolean | undefined>(correctAnswer);

  const handleSelect = (value: boolean) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Correct Answer</Label>

      <div className="grid grid-cols-2 gap-4">
        {/* True Option */}
        <Card
          className={`p-6 cursor-pointer transition-all hover:shadow-md ${
            selected === true
              ? "border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-green-300"
          }`}
          onClick={() => handleSelect(true)}
        >
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === true
                  ? "border-green-600 bg-green-600 dark:border-green-500 dark:bg-green-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {selected === true && <Check className="h-4 w-4 text-white" />}
            </div>
            <span className="text-lg font-semibold">True</span>
          </div>
        </Card>

        {/* False Option */}
        <Card
          className={`p-6 cursor-pointer transition-all hover:shadow-md ${
            selected === false
              ? "border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-green-300"
          }`}
          onClick={() => handleSelect(false)}
        >
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === false
                  ? "border-green-600 bg-green-600 dark:border-green-500 dark:bg-green-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {selected === false && <Check className="h-4 w-4 text-white" />}
            </div>
            <span className="text-lg font-semibold">False</span>
          </div>
        </Card>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Select the correct answer for this question.
      </p>
    </div>
  );
}

