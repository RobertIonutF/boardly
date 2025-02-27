import { BoardsList } from "@/components/dashboard/boards/boards-list";
import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Boards | Boardly",
  description: "Manage and organize your boards in one place.",
};

export default async function BoardsPage() {
  // Get the current user
  await getCurrentUser();
  
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<BoardsListSkeleton />}>
        <BoardsList />
      </Suspense>
    </div>
  );
}

function BoardsListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px] rounded-lg" />
        ))}
      </div>
    </div>
  );
} 