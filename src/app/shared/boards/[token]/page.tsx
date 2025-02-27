import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { format } from "date-fns";

import { BoardContent } from "@/components/dashboard/boards/board-content";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shared Board | Boardly",
  description: "View a shared board",
};

interface SharedBoardPageProps {
  params: {
    token: string;
  };
}

export default async function SharedBoardPage({ params }: SharedBoardPageProps) {
  const { token } = params;
  const { userId } = auth();

  // Find the share link
  const shareLink = await db.boardShare.findUnique({
    where: { token },
    include: { board: true },
  });

  // Check if share link exists and is not expired
  if (!shareLink) {
    return notFound();
  }

  if (new Date() > shareLink.expiresAt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Link Expired</h1>
          <p className="text-muted-foreground mb-6">
            This share link has expired and is no longer valid.
          </p>
          <Button asChild>
            <Link href="/dashboard/boards">
              Go to My Boards
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // If user is logged in and is the board owner or a member, redirect to the regular board page
  if (userId) {
    const board = await db.board.findUnique({
      where: { id: shareLink.boardId },
    });

    if (board && board.userId === userId) {
      return redirect(`/dashboard/boards/${board.id}`);
    }

    const isMember = await db.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId: shareLink.boardId,
          userId,
        },
      },
    });

    if (isMember) {
      return redirect(`/dashboard/boards/${shareLink.boardId}`);
    }
  }

  // Get the board with its lists and cards
  const board = await db.board.findUnique({
    where: { id: shareLink.boardId },
    include: {
      lists: {
        orderBy: { order: "asc" },
        include: {
          cards: {
            orderBy: { order: "asc" },
            include: {
              labels: true,
              assignee: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!board) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Shared board header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              asChild
            >
              <Link href="/dashboard/boards">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to boards</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{board.title}</h1>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  Shared link expires {format(shareLink.expiresAt, "PPP")}
                </span>
              </div>
            </div>
          </div>
          {userId && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/boards">
                <ExternalLink className="h-4 w-4 mr-2" />
                My Boards
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Board content in read-only mode */}
      <div className="flex-1 overflow-hidden">
        <BoardContent
          boardData={{
            ...board,
            activities: [],
            totalCards: 0,
            completedCards: 0,
            completionPercentage: 0,
          }}
          isReadOnly={true}
        />
      </div>

      {/* Footer with attribution */}
      <footer className="bg-muted py-3 text-center text-sm text-muted-foreground">
        <div className="container">
          Shared via Boardly - A modern project management tool
        </div>
      </footer>
    </div>
  );
} 