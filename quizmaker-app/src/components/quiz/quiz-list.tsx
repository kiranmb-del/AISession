"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string;
  duration_minutes: number | null;
  passing_score: number | null;
  is_published: number;
  created_at: string;
  updated_at: string;
}

type SortField = "created_at" | "updated_at" | "title";
type SortOrder = "asc" | "desc";

export function QuizList() {
  const router = useRouter();
  const { confirm, dialog } = useConfirmDialog();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes");
      const data = await response.json() as { quizzes: Quiz[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch quizzes");
      }

      setQuizzes(data.quizzes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (quiz: Quiz) => {
    confirm({
      title: "Delete Quiz",
      description: `Are you sure you want to delete "${quiz.title}"? This action cannot be undone and will delete all questions and answers.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/quizzes?quiz_id=${quiz.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const data = await response.json() as { error?: string };
            throw new Error(data.error || "Failed to delete quiz");
          }

          // Refresh the list
          await fetchQuizzes();
        } catch (err) {
          alert(err instanceof Error ? err.message : "Failed to delete quiz");
        }
      },
    });
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    const action = quiz.is_published ? "unpublish" : "publish";
    const actionTitle = quiz.is_published ? "Unpublish" : "Publish";
    
    confirm({
      title: `${actionTitle} Quiz`,
      description: quiz.is_published
        ? `Are you sure you want to unpublish "${quiz.title}"? Students will no longer be able to take this quiz.`
        : `Are you sure you want to publish "${quiz.title}"? Students will be able to take this quiz.`,
      confirmLabel: actionTitle,
      cancelLabel: "Cancel",
      variant: "default",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/quizzes/${quiz.id}/${action}`, {
            method: "POST",
          });

          const data = await response.json() as { error?: string };

          if (!response.ok) {
            throw new Error(data.error || `Failed to ${action} quiz`);
          }

          // Refresh the list
          await fetchQuizzes();
        } catch (err) {
          alert(err instanceof Error ? err.message : `Failed to ${action} quiz`);
        }
      },
    });
  };

  // Filtered and sorted quizzes
  const filteredAndSortedQuizzes = useMemo(() => {
    let filtered = quizzes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(query) ||
          quiz.description?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus === "published") {
      filtered = filtered.filter((quiz) => quiz.is_published === 1);
    } else if (filterStatus === "draft") {
      filtered = filtered.filter((quiz) => quiz.is_published === 0);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === "updated_at") {
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [quizzes, searchQuery, filterStatus, sortField, sortOrder]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-muted-foreground mb-4">
            You haven&apos;t created any quizzes yet.
          </p>
          <Button onClick={() => router.push("/dashboard/quizzes/new")}>
            Create Your First Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {dialog}
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  {filterStatus === "all" ? "All" : filterStatus === "published" ? "Published" : "Draft"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Quizzes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("published")}>
                  Published Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("draft")}>
                  Drafts Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M3 6h18" />
                    <path d="M7 12h10" />
                    <path d="M10 18h4" />
                  </svg>
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSortField("created_at"); setSortOrder("desc"); }}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortField("created_at"); setSortOrder("asc"); }}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortField("title"); setSortOrder("asc"); }}>
                  Title (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortField("title"); setSortOrder("desc"); }}>
                  Title (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortField("updated_at"); setSortOrder("desc"); }}>
                  Recently Updated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Results Count */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground">
            Found {filteredAndSortedQuizzes.length} {filteredAndSortedQuizzes.length === 1 ? "quiz" : "quizzes"}
          </p>
        )}
      </div>

      <div className="space-y-4 mt-4">
      {filteredAndSortedQuizzes.map((quiz) => (
        <Card key={quiz.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-xl">{quiz.title}</CardTitle>
                  <Badge variant={quiz.is_published ? "default" : "secondary"}>
                    {quiz.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                {quiz.description && (
                  <CardDescription>{quiz.description}</CardDescription>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/quizzes/${quiz.id}`)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/quizzes/${quiz.id}/edit`)}>
                    Edit Quiz
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/quizzes/${quiz.id}/questions`)}>
                    Manage Questions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleTogglePublish(quiz)}>
                    {quiz.is_published ? "Unpublish" : "Publish"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(quiz)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Quiz
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardFooter className="flex gap-4 text-sm text-muted-foreground">
            {quiz.duration_minutes && (
              <span>⏱️ {quiz.duration_minutes} minutes</span>
            )}
            {quiz.passing_score && (
              <span>✅ {quiz.passing_score}% to pass</span>
            )}
            <span className="ml-auto">
              Created {new Date(quiz.created_at).toLocaleDateString()}
            </span>
          </CardFooter>
        </Card>
      ))}
      
      {filteredAndSortedQuizzes.length === 0 && quizzes.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-muted-foreground">
              No quizzes match your search or filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}

