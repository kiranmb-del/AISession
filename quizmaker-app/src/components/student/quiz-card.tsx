/**
 * Student Quiz Card Component
 * Displays quiz information in a card format for browsing
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Target, User, ArrowRight } from "lucide-react";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string | null;
    instructor_name: string;
    duration_minutes: number | null;
    passing_score: number | null;
    question_count: number;
    created_at: string;
  };
}

export default function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-emerald-200 dark:hover:border-emerald-800">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {quiz.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              {quiz.instructor_name}
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
          >
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {quiz.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {quiz.description}
          </p>
        )}

        {/* Quiz Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{quiz.question_count} {quiz.question_count === 1 ? 'Question' : 'Questions'}</span>
          </div>

          {quiz.duration_minutes && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span>{quiz.duration_minutes} min</span>
            </div>
          )}

          {quiz.passing_score && (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{quiz.passing_score}% to pass</span>
            </div>
          )}
        </div>

        {/* Created Date */}
        <div className="text-xs text-gray-400 dark:text-gray-500">
          Created {new Date(quiz.created_at).toLocaleDateString()}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/student/quizzes/${quiz.id}`} className="w-full">
          <Button 
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-md group-hover:shadow-lg transition-all gap-2"
          >
            View Details
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

