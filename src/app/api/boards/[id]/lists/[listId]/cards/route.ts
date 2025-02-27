import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Schema for creating a new card
const createCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null),
});

// POST - Create a new card
export async function POST(
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
    
    // Check if the list exists and belongs to the board
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
        },
      },
    });
    
    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const validatedData = createCardSchema.parse(body);
    
    // Calculate the order for the new card (place it at the end)
    const order = list.cards.length > 0 
      ? list.cards[list.cards.length - 1].order + 1 
      : 0;
    
    // Create the new card
    const newCard = await prisma.card.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        order,
        dueDate: validatedData.dueDate,
        listId: params.listId,
        userId,
      },
    });
    
    // Create an activity record for the card creation
    await prisma.activity.create({
      data: {
        type: "create_card",
        entityType: "card",
        entityId: newCard.id,
        userId,
        boardId: params.id,
        cardId: newCard.id,
        data: JSON.parse(JSON.stringify({ 
          title: validatedData.title,
          listId: params.listId,
        })),
      },
    });
    
    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid card data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

// GET - Get all cards for a list
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
    
    // Check if the list exists and belongs to the board
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
            labels: true,
            comments: {
              select: {
                id: true,
              },
            },
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
    
    return NextResponse.json(list.cards);
  } catch (error) {
    console.error("Error getting cards:", error);
    return NextResponse.json(
      { error: "Failed to get cards" },
      { status: 500 }
    );
  }
} 