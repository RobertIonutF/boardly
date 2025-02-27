import { DashboardOverview } from "@/components/dashboard/overview";
import { getDashboardStats } from "@/lib/db/get-dashboard-stats";
import { getRecentBoards } from "@/lib/db/get-recent-boards";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const { id: userId } = await getCurrentUser();
  
  // Fetch dashboard statistics and recent boards
  const statsPromise = getDashboardStats(userId);
  const recentBoardsPromise = getRecentBoards(userId);
  
  // Wait for both promises to resolve
  const [stats, recentBoards] = await Promise.all([
    statsPromise,
    recentBoardsPromise
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your boards and activity.
        </p>
      </div>
      <DashboardOverview stats={stats} recentBoards={recentBoards} />
    </div>
  );
} 