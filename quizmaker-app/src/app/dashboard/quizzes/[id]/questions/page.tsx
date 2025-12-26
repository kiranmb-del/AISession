import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";
import { getQuizById } from "@/lib/services/quiz-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { 
  BookOpen, 
  LogOut,
  Users,
  ArrowLeft,
  Info
} from "lucide-react";

export default async function QuizQuestionsPage({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect("/login");
  }

  const user = await getUserById(currentUser.userId);
  
  if (!user || user.user_type !== "instructor") {
    redirect("/dashboard");
  }

  const quiz = await getQuizById(params.id);
  
  if (!quiz) {
    redirect("/dashboard/quizzes");
  }

  // Verify ownership
  if (quiz.instructor_id !== user.id) {
    redirect("/dashboard/quizzes");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/quizzes/${params.id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Quiz
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
              <CardTitle className="text-3xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <CardDescription className="text-base">{quiz.description}</CardDescription>
              )}
            </CardHeader>
          </Card>

          {/* Coming Soon Card */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-blue-100 to-purple-100 dark:from-blue-950 dark:via-blue-900 dark:to-purple-950 dark:border-blue-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-blue-200 dark:bg-blue-800 p-6 mb-6 animate-pulse">
                  <Info className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
              
                <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-3">
                  Question Management Coming Soon 🚀
                </h2>
              
                <p className="text-blue-800 dark:text-blue-200 mb-6 max-w-md text-lg">
                  This feature is part of <strong>Phase 1B: Question Management</strong> and will be implemented next.
                </p>
              
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 mb-8 max-w-lg shadow-lg">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                    <strong>Phase 1B will include:</strong>
                  </p>
                  <ul className="text-left text-sm text-gray-700 dark:text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 text-lg">✓</span>
                      <span>Add multiple choice questions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 text-lg">✓</span>
                      <span>Add true/false questions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 text-lg">✓</span>
                      <span>Add short answer questions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 text-lg">✓</span>
                      <span>Manage answer options</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 text-lg">✓</span>
                      <span>Drag-and-drop question ordering</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-3 text-lg">✓</span>
                      <span>Quiz preview</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href={`/dashboard/quizzes/${params.id}`}>
                    <Button variant="outline" size="lg">
                      Back to Quiz Details
                    </Button>
                  </Link>
                  <Link href="/dashboard/quizzes">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      View All Quizzes
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700">
            <CardHeader>
              <CardTitle>Implementation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    Phase 1A: Quiz Creation
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">100% Complete</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="text-2xl">⏳</span>
                    Phase 1B: Question Management
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Next Priority</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    Phase 2: Quiz Taking
                  </span>
                  <span className="text-sm text-gray-500">Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
