import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Schema for updating a card
const updateCardSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  order: z.number().optional(),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
  completed: z.boolean().optional(),
  listId: z.string().optional(), // For moving cards between lists
});

// GET - Get a specific card
export async function GET(
  req: Request,
  { params }: { params: { id: string; cardId: string } }
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
    
    // Get the card
    const card = await prisma.card.findFirst({
      where: {
        id: params.cardId,
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            boardId: true,
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        attachments: true,
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }
    
    // Verify the card belongs to the board
    if (card.list.boardId !== params.id) {
      return NextResponse.json(
        { error: "Card does not belong to this board" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(card);
  } catch (error) {
    console.error("Error getting card:", error);
    return NextResponse.json(
      { error: "Failed to get card" },
      { status: 500 }
    );
  }
}

// PATCH - Update a card
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; cardId: string } }
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
    
    // Get the card to verify it belongs to the board
    const card = await prisma.card.findFirst({
      where: {
        id: params.cardId,
      },
      include: {
        list: {
          select: {
            boardId: true,
          },
        },
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }
    
    // Verify the card belongs to the board
    if (card.list.boardId !== params.id) {
      return NextResponse.json(
        { error: "Card does not belong to this board" },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const validatedData = updateCardSchema.parse(body);
    
    // If moving to a different list, verify the target list belongs to the board
    if (validatedData.listId && validatedData.listId !== card.listId) {
      const targetList = await prisma.list.findFirst({
        where: {
          id: validatedData.listId,
          boardId: params.id,
        },
      });
      
      if (!targetList) {
        return NextResponse.json(
          { error: "Target list not found or does not belong to this board" },
          { status: 400 }
        );
      }
    }
    
    // Update the card
    const updatedCard = await prisma.card.update({
      where: {
        id: params.cardId,
      },
      data: validatedData,
    });
    
    // Create an activity record for the card update
    await prisma.activity.create({
      data: {
        type: validatedData.listId && validatedData.listId !== card.listId 
          ? "move_card" 
          : validatedData.completed !== undefined 
            ? validatedData.completed ? "complete_card" : "uncomplete_card"
            : "update_card",
        entityType: "card",
        entityId: params.cardId,
        userId,
        boardId: params.id,
        cardId: params.cardId,
        data: JSON.parse(JSON.stringify(validatedData)),
      },
    });
    
    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid card data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a card
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; cardId: string } }
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
    
    // Get the card to verify it belongs to the board and for activity record
    const card = await prisma.card.findFirst({
      where: {
        id: params.cardId,
      },
      include: {
        list: {
          select: {
            boardId: true,
            title: true,
          },
        },
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }
    
    // Verify the card belongs to the board
    if (card.list.boardId !== params.id) {
      return NextResponse.json(
        { error: "Card does not belong to this board" },
        { status: 403 }
      );
    }
    
    // Delete the card
    await prisma.card.delete({
      where: {
        id: params.cardId,
      },
    });
    
    // Create an activity record for the card deletion
    await prisma.activity.create({
      data: {
        type: "delete_card",
        entityType: "card",
        entityId: params.cardId,
        userId,
        boardId: params.id,
        data: JSON.parse(JSON.stringify({ 
          title: card.title,
          listTitle: card.list.title,
        })),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
} 