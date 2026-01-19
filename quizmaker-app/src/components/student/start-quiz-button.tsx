/**
 * Start Quiz Button Component
 * Client component to handle quiz start action
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StartQuizButtonProps {
  quizId: string;
}

export default function StartQuizButton({ quizId }: StartQuizButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/student/quizzes/${quizId}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json() as { error?: string };
        throw new Error(error.error || "Failed to start quiz");
      }

      const attempt = await response.json() as { id: string };
      toast.success("Quiz started! Good luck!");
      
      // Redirect to quiz taking page
      router.push(`/student/quizzes/${quizId}/attempt/${attempt.id}`);
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start quiz");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStartQuiz}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-md gap-2 h-12"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Starting...
        </>
      ) : (
        <>
          <PlayCircle className="h-5 w-5" />
          Start Quiz
        </>
      )}
    </Button>
  );
}

