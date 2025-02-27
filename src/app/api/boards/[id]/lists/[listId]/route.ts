import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Schema for updating a list
const updateListSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  order: z.number().optional(),
});

// GET - Get a specific list
export async function GET(
  req: Request,
  { params }: { params: { id: string; listId: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Check if the board exists and belongs to the user
    const board = await prisma.board.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { error: "Board not found or you don't have permission to access it" },
        { status: 404 }
      );
    }
    
    // Get the list
    const list = await prisma.list.findFirst({
      where: {
        id: params.listId,
        boardId: params.id,
      },
      include: {
        cards: {
          orderBy: {
            order: "asc",
          },
          include: {
            comments: {
              select: {
                id: true,
              },
            },
            labels: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
    
    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(list);
  } catch (error) {
    console.error("Error getting list:", error);
    return NextResponse.json(
      { error: "Failed to get list" },
      { status: 500 }
    );
  }
}

// PATCH - Update a list
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; listId: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Check if the board exists and belongs to the user
    const board = await prisma.board.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { error: "Board not found or you don't have permission to modify it" },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const validatedData = updateListSchema.parse(body);
    
    // Update the list
    const updatedList = await prisma.list.update({
      where: {
        id: params.listId,
      },
      data: validatedData,
    });
    
    // Create an activity record for the list update
    await prisma.activity.create({
      data: {
        type: "update_list",
        entityType: "list",
        entityId: params.listId,
        userId,
        boardId: params.id,
        data: JSON.parse(JSON.stringify(validatedData)),
      },
    });
    
    return NextResponse.json(updatedList);
  } catch (error) {
    console.error("Error updating list:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid list data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a list
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; listId: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Check if the board exists and belongs to the user
    const board = await prisma.board.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { error: "Board not found or you don't have permission to modify it" },
        { status: 404 }
      );
    }
    
    // Get the list to be deleted (for activity record)
    const list = await prisma.list.findUnique({
      where: {
        id: params.listId,
      },
    });
    
    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }
    
    // Delete the list (cascading delete will handle cards)
    await prisma.list.delete({
      where: {
        id: params.listId,
      },
    });
    
    // Create an activity record for the list deletion
    await prisma.activity.create({
      data: {
        type: "delete_list",
        entityType: "list",
        entityId: params.listId,
        userId,
        boardId: params.id,
        data: JSON.parse(JSON.stringify({ 
          title: list.title,
        })),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting list:", error);
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
} 