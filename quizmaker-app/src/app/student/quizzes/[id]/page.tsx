/**
 * Student Quiz Detail Page
 * Shows quiz details and allows student to start a quiz attempt
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";
import { getQuizWithInstructor, getQuestionsByQuiz } from "@/lib/services/quiz-service";
import { getActiveAttempt, getAttemptsByQuiz } from "@/lib/services/quiz-attempt-service";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Target, User, PlayCircle, History, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import StartQuizButton from "@/components/student/start-quiz-button";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentQuizDetailPage({ params }: PageProps) {
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

  const { id: quizId } = await params;

  // Fetch quiz details
  const quiz = await getQuizWithInstructor(quizId);
  if (!quiz || quiz.is_published !== 1) {
    redirect("/student/quizzes");
  }

  // Get questions
  const questions = await getQuestionsByQuiz(quizId);

  // Check for active attempt
  const activeAttempt = await getActiveAttempt(quizId, user.id);

  // Get previous attempts
  const previousAttempts = await getAttemptsByQuiz(quizId, user.id);
  const completedAttempts = previousAttempts.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-emerald-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/student/quizzes">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Quizzes
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Quiz Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {quiz.title}
          </h2>
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <User className="h-5 w-5" />
            <span className="font-medium">{quiz.instructor_name}</span>
          </div>
        </div>

        {/* Active Attempt Alert */}
        {activeAttempt && (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800">
            <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertTitle className="text-emerald-900 dark:text-emerald-100">
              You have an active attempt
            </AlertTitle>
            <AlertDescription className="text-emerald-700 dark:text-emerald-300">
              You started this quiz on {new Date(activeAttempt.started_at).toLocaleString()}. Continue where you left off.
            </AlertDescription>
            <div className="mt-4">
              <Link href={`/student/quizzes/${quizId}/attempt/${activeAttempt.id}`}>
                <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                  Continue Quiz
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Description */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">About This Quiz</CardTitle>
              </CardHeader>
              <CardContent>
                {quiz.description ? (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {quiz.description}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No description provided
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Previous Attempts */}
            {completedAttempts.length > 0 && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Your Previous Attempts
                  </CardTitle>
                  <CardDescription>
                    You&apos;ve completed this quiz {completedAttempts.length} time{completedAttempts.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(attempt.started_at).toLocaleDateString()}
                          </p>
                          {attempt.completed_at && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Completed {new Date(attempt.completed_at).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        {attempt.score !== null && attempt.total_points !== null && (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {Math.round((attempt.score / attempt.total_points) * 100)}%
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {attempt.score}/{attempt.total_points} pts
                              </p>
                            </div>
                            <Link href={`/student/attempts/${attempt.id}/results`}>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quiz Info Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow border-2 border-emerald-100 dark:border-emerald-900">
              <CardHeader>
                <CardTitle className="text-xl">Quiz Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Questions</p>
                    <p className="font-semibold">{questions.length}</p>
                  </div>
                </div>

                {quiz.duration_minutes && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time Limit</p>
                      <p className="font-semibold">{quiz.duration_minutes} minutes</p>
                    </div>
                  </div>
                )}

                {quiz.passing_score && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Passing Score</p>
                      <p className="font-semibold">{quiz.passing_score}%</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!activeAttempt ? (
                    <StartQuizButton quizId={quizId} />
                  ) : (
                    <Link href={`/student/quizzes/${quizId}/attempt/${activeAttempt.id}`} className="w-full">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-md gap-2 h-12">
                        <PlayCircle className="h-5 w-5" />
                        Continue Quiz
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-cyan-200 dark:border-cyan-900">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success 💡</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>✓ Read each question carefully</p>
                <p>✓ Check your answers before submitting</p>
                {quiz.duration_minutes && <p>✓ Manage your time wisely</p>}
                <p>✓ Stay focused and take your time</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

