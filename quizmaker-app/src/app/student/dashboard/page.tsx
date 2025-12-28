/**
 * Student Dashboard Page
 * Main landing page for students with stats and quick actions
 */

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";
import { getAttemptsByStudent, getStudentStats } from "@/lib/services/quiz-attempt-service";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { BookOpen, Clock, Trophy, TrendingUp, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function StudentDashboard() {
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

  // Fetch student statistics
  const stats = await getStudentStats(user.id);
  const recentAttempts = await getAttemptsByStudent(user.id);

  // Get recent 5 attempts
  const recentFive = recentAttempts.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-emerald-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.full_name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to learn something new today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Quizzes Taken */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Quizzes Taken</CardTitle>
                <BookOpen className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats?.total_attempts || 0}</p>
              <p className="text-emerald-100 text-sm mt-1">Total attempts</p>
            </CardContent>
          </Card>

          {/* Completed Quizzes */}
          <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Completed</CardTitle>
                <Trophy className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats?.completed_attempts || 0}</p>
              <p className="text-cyan-100 text-sm mt-1">Finished quizzes</p>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Average Score</CardTitle>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {stats?.average_score_percentage ? `${stats.average_score_percentage}%` : "N/A"}
              </p>
              <p className="text-purple-100 text-sm mt-1">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
            <CardDescription>Start your learning journey</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Link href="/student/quizzes" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-md gap-2 h-12">
                <BookOpen className="h-5 w-5" />
                Browse Available Quizzes
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </Link>
            <Link href="/student/attempts" className="flex-1">
              <Button variant="outline" className="w-full h-12 gap-2">
                <Clock className="h-5 w-5" />
                View My Attempts
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Attempts */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest quiz attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFive.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No quiz attempts yet
                </p>
                <Link href="/student/quizzes">
                  <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                    Take Your First Quiz
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentFive.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {attempt.quiz_title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {attempt.instructor_name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(attempt.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {attempt.status === 'completed' && attempt.score !== null && attempt.total_points !== null ? (
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {Math.round((attempt.score / attempt.total_points) * 100)}%
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {attempt.score}/{attempt.total_points} pts
                          </p>
                        </div>
                      ) : (
                        <Badge 
                          variant={attempt.status === 'in_progress' ? 'default' : 'secondary'}
                          className={attempt.status === 'in_progress' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : ''}
                        >
                          {attempt.status.replace('_', ' ')}
                        </Badge>
                      )}
                      {attempt.status === 'in_progress' && (
                        <Link href={`/student/quizzes/${attempt.quiz_id}/attempt/${attempt.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-cyan-600">
                            Continue
                          </Button>
                        </Link>
                      )}
                      {attempt.status === 'completed' && (
                        <Link href={`/student/attempts/${attempt.id}/results`}>
                          <Button size="sm" variant="outline">
                            View Results
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

