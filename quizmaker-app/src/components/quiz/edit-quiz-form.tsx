"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface EditQuizFormProps {
  quizId: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  passing_score: number | null;
  is_published: number;
}

export function EditQuizForm({ quizId }: EditQuizFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMinutes: "",
    passingScore: "",
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`);
        const data = await response.json() as { quiz: Quiz; error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch quiz");
        }

        setQuiz(data.quiz);
        setFormData({
          title: data.quiz.title,
          description: data.quiz.description || "",
          durationMinutes: data.quiz.duration_minutes?.toString() || "",
          passingScore: data.quiz.passing_score?.toString() || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/quizzes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId,
          title: formData.title,
          description: formData.description || undefined,
          durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
          passingScore: formData.passingScore ? parseInt(formData.passingScore) : undefined,
        }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quiz");
      }

      // Success! Go back to quiz detail
      router.push(`/dashboard/quizzes/${quizId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !quiz) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Quiz</CardTitle>
        <CardDescription>
          Update the quiz details below.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              Quiz Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Chapter 1: Introduction to Biology"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a brief description of what this quiz covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isSaving}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes)</Label>
              <Input
                id="durationMinutes"
                type="number"
                min="1"
                max="600"
                placeholder="30"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for no time limit
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min="0"
                max="100"
                placeholder="70"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                Minimum score required to pass
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/quizzes/${quizId}`)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving || !formData.title.trim()}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

