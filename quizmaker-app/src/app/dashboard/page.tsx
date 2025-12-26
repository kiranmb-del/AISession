import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/services/user-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { 
  BookOpen, 
  LogOut, 
  GraduationCap, 
  Users, 
  ClipboardList,
  Trophy,
  Calendar,
  Plus,
  BarChart3
} from "lucide-react";

/**
 * Dashboard Page
 * Shows different content based on user type (student or instructor)
 */
export default async function DashboardPage() {
  // Get current authenticated user
  const authUser = await getCurrentUser();
  
  if (!authUser) {
    redirect("/login");
  }
  
  // Get full user details
  const user = await getUserById(authUser.userId);
  
  if (!user) {
    redirect("/login");
  }

  const isInstructor = user.user_type === "instructor";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  QuizMaker
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={isInstructor ? "default" : "secondary"} className="text-xs">
                    {isInstructor ? (
                      <><Users className="h-3 w-3 mr-1" />Instructor</>
                    ) : (
                      <><GraduationCap className="h-3 w-3 mr-1" />Student</>
                    )}
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
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.full_name}! 👋
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isInstructor
              ? "Manage your quizzes and track student performance."
              : "Take quizzes and track your progress."}
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isInstructor ? <InstructorDashboard /> : <StudentDashboard />}
        </div>
      </main>
    </div>
  );
}

/**
 * Student Dashboard Component
 */
function StudentDashboard() {
  return (
    <>
      {/* Available Quizzes */}
      <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700 animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Available Quizzes</CardTitle>
              <CardDescription>Quizzes you can take</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No quizzes available yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Check back later for new quizzes from your instructors
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700 animate-fade-in-up animation-delay-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Recent Attempts</CardTitle>
              <CardDescription>Your quiz history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No quiz attempts yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Your quiz results will appear here after you take a quiz
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700 animate-fade-in-up animation-delay-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Performance</CardTitle>
              <CardDescription>Your overall statistics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Quizzes Taken</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">-</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Quizzes Passed</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">0</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/**
 * Instructor Dashboard Component
 */
function InstructorDashboard() {
  return (
    <>
      {/* My Quizzes */}
      <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700 animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">My Quizzes</CardTitle>
              <CardDescription>Quizzes you&apos;ve created</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <ClipboardList className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4">Manage your quizzes</p>
            <Link href="/dashboard/quizzes">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ClipboardList className="h-4 w-4 mr-2" />
                View My Quizzes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700 animate-fade-in-up animation-delay-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription>Latest student submissions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No recent activity</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Student quiz attempts will appear here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="hover:shadow-xl transition-all duration-300 border-0 dark:border dark:border-gray-700 animate-fade-in-up animation-delay-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 w-10 h-10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Statistics</CardTitle>
              <CardDescription>Your teaching metrics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Quizzes</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Students</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Score</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">-</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

