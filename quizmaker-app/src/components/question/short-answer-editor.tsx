/**
 * Short Answer Question Editor
 * Component for creating and editing short answer questions
 */

"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ShortAnswerEditorProps {
  sampleAnswer?: string;
  answerGuidelines?: string;
  onChange: (data: { sampleAnswer?: string; answerGuidelines?: string }) => void;
  error?: string;
}

export function ShortAnswerEditor({
  sampleAnswer = "",
  answerGuidelines = "",
  onChange,
  error,
}: ShortAnswerEditorProps) {
  const [sample, setSample] = useState(sampleAnswer);
  const [guidelines, setGuidelines] = useState(answerGuidelines);

  const handleSampleChange = (value: string) => {
    setSample(value);
    onChange({ sampleAnswer: value, answerGuidelines: guidelines });
  };

  const handleGuidelinesChange = (value: string) => {
    setGuidelines(value);
    onChange({ sampleAnswer: sample, answerGuidelines: value });
  };

  return (
    <div className="space-y-6">
      {/* Sample Answer */}
      <div className="space-y-2">
        <Label htmlFor="sample-answer" className="text-base font-semibold">
          Sample Answer <span className="text-sm text-gray-500 font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="sample-answer"
          placeholder="Provide a sample answer that demonstrates what you're looking for..."
          value={sample}
          onChange={(e) => handleSampleChange(e.target.value)}
          rows={4}
          maxLength={2000}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {sample.length}/2000 characters
        </p>
      </div>

      {/* Answer Guidelines */}
      <div className="space-y-2">
        <Label htmlFor="answer-guidelines" className="text-base font-semibold">
          Grading Guidelines <span className="text-sm text-gray-500 font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="answer-guidelines"
          placeholder="Provide guidelines for grading this answer (e.g., key points to look for, common mistakes to avoid)..."
          value={guidelines}
          onChange={(e) => handleGuidelinesChange(e.target.value)}
          rows={4}
          maxLength={1000}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {guidelines.length}/1000 characters
        </p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Short answer questions require manual grading by the instructor.
          The sample answer and guidelines will help you evaluate student responses.
        </p>
      </div>
    </div>
  );
}

