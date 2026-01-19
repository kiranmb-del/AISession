"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface CreateQuizFormProps {
  onSuccess?: (quizId: string) => void;
  onCancel?: () => void;
}

export function CreateQuizForm({ onSuccess, onCancel }: CreateQuizFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMinutes: "",
    passingScore: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: Include cookies in the request
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : undefined,
          passingScore: formData.passingScore ? parseInt(formData.passingScore) : undefined,
        }),
      });

      const data = await response.json() as { quiz: { id: string }; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to create quiz");
      }

      // Success!
      if (onSuccess) {
        onSuccess(data.quiz.id);
      } else {
        router.push(`/dashboard/quizzes/${data.quiz.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Quiz</CardTitle>
        <CardDescription>
          Fill in the details below to create a new quiz. You can add questions after creating the quiz.
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
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a brief description of what this quiz covers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Minimum score required to pass
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading || !formData.title.trim()}
            className={!onCancel ? "ml-auto" : ""}
          >
            {isLoading ? "Creating..." : "Create Quiz"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

