/**
 * Student Quizzes Browse Page
 * Shows all published quizzes available for students to take
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";
import { getPublishedQuizzes } from "@/lib/services/quiz-service";
import { getQuestionsByQuiz } from "@/lib/services/quiz-service";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { ArrowLeft, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import QuizCard from "@/components/student/quiz-card";

export default async function StudentQuizzesPage() {
  const authUser = await getCurrentUser();

  if (!authUser) {
    redirect("/login");
  }

  if (authUser.userType !== "student") {
    redirect("/dashboard");
  }

  // Get full user details
  const user = await getUserById(authUser.userId);
  
  if (!user) {
    redirect("/login");
  }

  // Fetch all published quizzes
  const quizzes = await getPublishedQuizzes();

  // Enhance each quiz with question count
  const quizzesWithCount = await Promise.all(
    quizzes.map(async (quiz) => {
      const questions = await getQuestionsByQuiz(quiz.id);
      return {
        ...quiz,
        question_count: questions.length,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-emerald-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                QuizMaker
              </h1>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                Student
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {user.full_name}
              </span>
              <ThemeToggle />
              <form action={logoutAction}>
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Available Quizzes
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and take quizzes created by your instructors
          </p>
        </div>

        {/* Stats Bar */}
        <Card className="mb-8 shadow-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8" />
                <div>
                  <p className="text-2xl font-bold">{quizzesWithCount.length}</p>
                  <p className="text-emerald-100 text-sm">Available Quizzes</p>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-emerald-100">
                  Start learning today! 🚀
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Grid */}
        {quizzesWithCount.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-12">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Quizzes Available Yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Check back later for new quizzes from your instructors
                </p>
                <Link href="/student/dashboard">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzesWithCount.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

