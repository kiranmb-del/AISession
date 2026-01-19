import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/actions/auth";
import { QuizList } from "@/components/quiz/quiz-list";
import Link from "next/link";
import { 
  BookOpen, 
  LogOut,
  Users,
  Plus,
  ArrowLeft
} from "lucide-react";

export default async function InstructorQuizzesPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect("/login");
  }

  const user = await getUserById(currentUser.userId);
  
  if (!user || user.user_type !== "instructor") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
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
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                My Quizzes 📚
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Create and manage your quizzes
              </p>
            </div>
            <Link href="/dashboard/quizzes/new">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-5 w-5" />
                Create Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* Quiz List */}
        <QuizList />
      </main>
    </div>
  );
}
