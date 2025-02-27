import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { randomBytes } from "crypto";

// Schema for creating a share link
const createShareLinkSchema = z.object({
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

// Helper to check if user is board owner
async function isBoardOwner(boardId: string, userId: string) {
  const board = await db.board.findUnique({
    where: { id: boardId, userId },
  });
  
  return !!board;
}

// Helper to check if user is board member
async function isBoardMember(boardId: string, userId: string) {
  const member = await db.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId,
      },
    },
  });
  
  return !!member;
}

// GET /api/boards/[id]/share - Get all share links for a board
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const boardId = params.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is board owner or a member
    const isOwner = await isBoardOwner(boardId, userId);
    const isMember = await isBoardMember(boardId, userId);

    if (!isOwner && !isMember) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all share links for the board
    const shareLinks = await db.boardShare.findMany({
      where: { boardId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(shareLinks);
  } catch (error) {
    console.error("[BOARD_SHARE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/boards/[id]/share - Create a new share link
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const boardId = params.id;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is board owner or a member with EDITOR role
    const isOwner = await isBoardOwner(boardId, userId);
    
    if (!isOwner) {
      const member = await db.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId,
          },
        },
      });
      
      if (!member || member.role !== "EDITOR") {
        return new NextResponse("Only board owners and editors can create share links", { status: 403 });
      }
    }

    const body = await req.json();
    const validatedData = createShareLinkSchema.parse(body);

    // Generate a random token
    const token = randomBytes(32).toString("hex");
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);

    // Create the share link
    const shareLink = await db.boardShare.create({
      data: {
        boardId,
        token,
        expiresAt,
      },
    });

    // Create activity record
    await db.activity.create({
      data: {
        type: "create_share_link",
        entityType: "board",
        entityId: boardId,
        userId,
        boardId,
        data: {
          expiresAt: expiresAt.toISOString(),
        },
      },
    });

    return NextResponse.json(shareLink);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    
    console.error("[BOARD_SHARE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/boards/[id]/share/[shareId] - Delete a share link
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; shareId: string } }
) {
  try {
    const { userId } = await auth();
    const { id: boardId, shareId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is board owner or a member with EDITOR role
    const isOwner = await isBoardOwner(boardId, userId);
    
    if (!isOwner) {
      const member = await db.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId,
          },
        },
      });
      
      if (!member || member.role !== "EDITOR") {
        return new NextResponse("Only board owners and editors can revoke share links", { status: 403 });
      }
    }

    // Delete the share link
    await db.boardShare.delete({
      where: { id: shareId },
    });

    // Create activity record
    await db.activity.create({
      data: {
        type: "revoke_share_link",
        entityType: "board",
        entityId: boardId,
        userId,
        boardId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BOARD_SHARE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 