import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";
import { getQuizWithInstructor, getQuizStats, getQuizQuestionCount } from "@/lib/services/quiz-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { 
  BookOpen, 
  LogOut,
  Users,
  ArrowLeft,
  Edit,
  ClipboardList
} from "lucide-react";

export default async function QuizDetailPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect("/login");
  }

  const user = await getUserById(currentUser.userId);
  
  if (!user || user.user_type !== "instructor") {
    redirect("/dashboard");
  }

  const quiz = await getQuizWithInstructor(params.id);
  
  if (!quiz) {
    redirect("/dashboard/quizzes");
  }

  // Verify ownership
  if (quiz.instructor_id !== user.id) {
    redirect("/dashboard/quizzes");
  }

  const questionCount = await getQuizQuestionCount(params.id);
  const stats = await getQuizStats(params.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/quizzes">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  My Quizzes
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    QuizMaker
                  </h1>
                  <Badge variant="default" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Instructor
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <form action={logoutAction}>
                <Button type="submit" variant="outline" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 animate-fade-in">
          {/* Quiz Header */}
          <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-3xl">{quiz.title}</CardTitle>
                    <Badge variant={quiz.is_published ? "default" : "secondary"}>
                      {quiz.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {quiz.description && (
                    <CardDescription className="text-base">{quiz.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Duration:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {quiz.duration_minutes ? `${quiz.duration_minutes} minutes` : "No limit"}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Passing Score:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {quiz.passing_score ? `${quiz.passing_score}%` : "Not set"}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 block mb-1">Questions:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{questionCount}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link href={`/dashboard/quizzes/${params.id}/edit`}>
                  <Button variant="default" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Quiz
                  </Button>
                </Link>
                <Link href={`/dashboard/quizzes/${params.id}/questions`}>
                  <Button variant="outline" className="gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Manage Questions
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700">
            <CardHeader>
              <CardTitle>Statistics 📊</CardTitle>
              <CardDescription>Overview of quiz performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.total_attempts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Attempts</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.completed_attempts}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {stats.average_score !== null ? `${stats.average_score.toFixed(1)}%` : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Score</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
                  <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.pass_rate !== null ? `${stats.pass_rate.toFixed(1)}%` : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pass Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Banner */}
          {!quiz.is_published && questionCount === 0 && (
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 dark:border-amber-800 animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                      This quiz needs at least one question before it can be published.
                    </p>
                    <Link href={`/dashboard/quizzes/${params.id}/questions`}>
                      <Button variant="outline" className="mt-2" size="sm">
                        Add Questions
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
