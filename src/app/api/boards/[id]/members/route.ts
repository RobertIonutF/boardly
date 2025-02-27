import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for adding a board member
const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
});

// Schema for updating a board member
const updateMemberSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});

// Helper to check if user is board owner
async function isBoardOwner(boardId: string, userId: string) {
  const board = await db.board.findUnique({
    where: { id: boardId, userId },
  });
  
  return !!board;
}

// GET /api/boards/[id]/members - Get all members of a board
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
    const board = await db.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    // Check if user is owner or member
    const isOwner = board.userId === userId;
    const isMember = board.members.some(member => member.userId === userId);

    if (!isOwner && !isMember) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(board.members);
  } catch (error) {
    console.error("[BOARD_MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/boards/[id]/members - Add a member to a board
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

    // Check if user is board owner
    const isOwner = await isBoardOwner(boardId, userId);
    if (!isOwner) {
      return new NextResponse("Only board owners can add members", { status: 403 });
    }

    const body = await req.json();
    const validatedData = addMemberSchema.parse(body);

    // Find user by email
    const userToAdd = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!userToAdd) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await db.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: userToAdd.id,
        },
      },
    });

    if (existingMember) {
      return new NextResponse("User is already a member of this board", { status: 400 });
    }

    // Add user as a member
    const boardMember = await db.boardMember.create({
      data: {
        boardId,
        userId: userToAdd.id,
        role: validatedData.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    // Create activity record
    await db.activity.create({
      data: {
        type: "add_member",
        entityType: "board",
        entityId: boardId,
        userId,
        boardId,
        data: {
          memberEmail: userToAdd.email,
          memberRole: validatedData.role,
        },
      },
    });

    return NextResponse.json(boardMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    
    console.error("[BOARD_MEMBERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/boards/[id]/members/[memberId] - Update a member's role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    const { id: boardId, memberId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is board owner
    const isOwner = await isBoardOwner(boardId, userId);
    if (!isOwner) {
      return new NextResponse("Only board owners can update member roles", { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateMemberSchema.parse(body);

    // Update member role
    const updatedMember = await db.boardMember.update({
      where: { id: memberId },
      data: { role: validatedData.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    // Create activity record
    await db.activity.create({
      data: {
        type: "update_member_role",
        entityType: "board",
        entityId: boardId,
        userId,
        boardId,
        data: {
          memberEmail: updatedMember.user.email,
          memberRole: validatedData.role,
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    
    console.error("[BOARD_MEMBERS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/boards/[id]/members/[memberId] - Remove a member from a board
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    const { id: boardId, memberId } = params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is board owner
    const isOwner = await isBoardOwner(boardId, userId);
    
    // Get the member to be removed
    const memberToRemove = await db.boardMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!memberToRemove) {
      return new NextResponse("Member not found", { status: 404 });
    }

    // Allow users to remove themselves, otherwise only owner can remove
    if (memberToRemove.userId !== userId && !isOwner) {
      return new NextResponse("Only board owners can remove other members", { status: 403 });
    }

    // Remove the member
    await db.boardMember.delete({
      where: { id: memberId },
    });

    // Create activity record
    await db.activity.create({
      data: {
        type: "remove_member",
        entityType: "board",
        entityId: boardId,
        userId,
        boardId,
        data: {
          memberEmail: memberToRemove.user.email,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BOARD_MEMBERS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 