import { BoardHeader } from "@/components/dashboard/boards/board-header";
import { BoardContent } from "@/components/dashboard/boards/board-content";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getBoardDetail } from "@/lib/db/get-board-detail";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Board Details | Boardly",
  description: "View and manage your board tasks and details.",
};

interface BoardPageProps {
  params: {
    id: string;
  };
}

export default async function BoardPage({ params }: BoardPageProps) {
  // Get the current user
  const { id: userId } = await getCurrentUser();
  
  // Fetch board details
  const board = await getBoardDetail(params.id, userId);
  
  // If board not found or user doesn't have access, redirect to 404
  if (!board) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4 py-6">
      <BoardHeader boardData={board} />
      <Suspense fallback={<BoardContentSkeleton />}>
        <BoardContent boardData={board} />
      </Suspense>
    </div>
  );
}

function BoardContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <Skeleton className="h-10 w-[200px]" />
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px]">
            <div className="bg-card rounded-lg border shadow-sm p-3 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-24 w-full rounded-md" />
                ))}
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}
        <div className="flex-shrink-0 w-[280px]">
          <Skeleton className="h-[120px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
} 