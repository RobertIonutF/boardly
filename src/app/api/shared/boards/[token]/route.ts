import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/shared/boards/[token] - Get a board via share link
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    // Find the share link
    const shareLink = await db.boardShare.findUnique({
      where: { token },
      include: { board: true },
    });

    // Check if share link exists and is not expired
    if (!shareLink) {
      return new NextResponse("Share link not found", { status: 404 });
    }

    if (new Date() > shareLink.expiresAt) {
      return new NextResponse("Share link has expired", { status: 410 });
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
      return new NextResponse("Board not found", { status: 404 });
    }

    // Return the board data
    return NextResponse.json({
      board,
      isSharedView: true,
      shareLink,
    });
  } catch (error) {
    console.error("[SHARED_BOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 