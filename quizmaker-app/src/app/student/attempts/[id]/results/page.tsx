/**
 * Quiz Results Page - Placeholder for Phase 2C
 * This page will show quiz results after completion
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function QuizResultsPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.userType !== "student") {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Construction className="h-8 w-8 text-yellow-600" />
              Quiz Results - Coming in Phase 2C
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              This page will display your quiz results including score, percentage, and detailed review.
            </p>

            <div className="pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Attempt ID: {id}
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

