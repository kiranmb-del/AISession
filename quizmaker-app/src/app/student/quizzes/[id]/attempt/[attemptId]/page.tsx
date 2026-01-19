/**
 * Quiz Taking Page - Placeholder for Phase 2B
 * This page will be implemented in Phase 2B
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAttemptById } from "@/lib/services/quiz-attempt-service";
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PageProps {
  params: Promise<{
    id: string;
    attemptId: string;
  }>;
}

export default async function QuizAttemptPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.userType !== "student") {
    redirect("/dashboard");
  }

  const { attemptId } = await params;
  const attempt = await getAttemptById(attemptId);
  if (!attempt || attempt.student_id !== user.userId) {
    redirect("/student/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Construction className="h-8 w-8 text-yellow-600" />
              Quiz Taking Interface - Coming in Phase 2B
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTitle>Under Construction 🚧</AlertTitle>
              <AlertDescription>
                The quiz taking interface will be implemented in Phase 2B. This includes:
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>✓ Question display and navigation</p>
              <p>✓ Answer input for all question types</p>
              <p>✓ Timer functionality</p>
              <p>✓ Auto-save answers</p>
              <p>✓ Submit quiz with confirmation</p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Attempt ID: {attemptId}
              </p>
              <Link href="/student/dashboard">
                <Button className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

