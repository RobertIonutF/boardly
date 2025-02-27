import { NextResponse } from "next/server";
import { updateBoard, deleteBoard } from "@/lib/db/board-operations";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema for board update
const updateBoardSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional(),
  color: z.string().optional(),
});

// Schema for board duplication
const duplicateBoardSchema = z.object({
  action: z.literal("duplicate"),
});

// Schema for board archiving
const archiveBoardSchema = z.object({
  action: z.literal("archive"),
  archived: z.boolean(),
});

// GET board by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Get the board by ID
    const board = await prisma.board.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(board);
  } catch (error) {
    console.error("Error getting board:", error);
    return NextResponse.json(
      { error: "Failed to get board" },
      { status: 500 }
    );
  }
}

// Update board
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Parse the request body
    const body = await req.json();
    
    // Check if this is an archive action
    if (body.action === "archive") {
      const validatedData = archiveBoardSchema.parse(body);
      
      // Update the board's archived status
      const updatedBoard = await prisma.board.update({
        where: {
          id: params.id,
        },
        data: {
          archived: validatedData.archived,
        },
      });
      
      // Create an activity record for the archive action
      await prisma.activity.create({
        data: {
          type: validatedData.archived ? "archive_board" : "unarchive_board",
          entityType: "board",
          entityId: params.id,
          userId,
          boardId: params.id,
          data: JSON.parse(JSON.stringify({ archived: validatedData.archived })),
        },
      });
      
      return NextResponse.json(updatedBoard);
    }
    
    // Regular update
    const validatedData = updateBoardSchema.parse(body);
    
    // Update the board
    const updatedBoard = await updateBoard(params.id, userId, validatedData);
    
    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("Error updating board:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid board data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 }
    );
  }
}

// Delete board
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Delete the board
    await deleteBoard(params.id, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting board:", error);
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 }
    );
  }
}

// Duplicate board
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    duplicateBoardSchema.parse(body);
    
    // Get the original board
    const originalBoard = await prisma.board.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        lists: {
          include: {
            cards: true,
          },
        },
      },
    });
    
    if (!originalBoard) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }
    
    // Create a new board with the same data
    const newBoard = await prisma.board.create({
      data: {
        title: `${originalBoard.title} (Copy)`,
        description: originalBoard.description,
        imageUrl: originalBoard.imageUrl,
        userId,
        category: originalBoard.category,
        color: originalBoard.color,
      },
    });
    
    // Create lists for the new board
    for (const list of originalBoard.lists) {
      const newList = await prisma.list.create({
        data: {
          title: list.title,
          order: list.order,
          boardId: newBoard.id,
        },
      });
      
      // Create cards for the new list
      for (const card of list.cards) {
        await prisma.card.create({
          data: {
            title: card.title,
            description: card.description,
            order: card.order,
            listId: newList.id,
            dueDate: card.dueDate,
            completed: card.completed,
            userId,
          },
        });
      }
    }
    
    // Create an activity record for the duplication
    await prisma.activity.create({
      data: {
        type: "duplicate_board",
        entityType: "board",
        entityId: newBoard.id,
        userId,
        boardId: newBoard.id,
        data: JSON.parse(JSON.stringify({ 
          originalBoardId: params.id,
          title: newBoard.title,
        })),
      },
    });
    
    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error("Error duplicating board:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to duplicate board" },
      { status: 500 }
    );
  }
} 