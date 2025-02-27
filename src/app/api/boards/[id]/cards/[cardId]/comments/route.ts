import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Schema for creating a new comment
const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
});

// POST - Create a new comment
export async function POST(
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
    
    // Check if the card exists and belongs to a list in this board
    const card = await prisma.card.findFirst({
      where: {
        id: params.cardId,
        list: {
          boardId: params.id,
        },
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Card not found or does not belong to this board" },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await req.json();
    
    // Validate the request body
    const validatedData = createCommentSchema.parse(body);
    
    // Create the new comment
    const newComment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId,
        cardId: params.cardId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
    
    // Create an activity record for the comment creation
    await prisma.activity.create({
      data: {
        type: "add_comment",
        entityType: "comment",
        entityId: newComment.id,
        userId,
        boardId: params.id,
        cardId: params.cardId,
        data: JSON.parse(JSON.stringify({ 
          content: validatedData.content.substring(0, 50) + (validatedData.content.length > 50 ? "..." : ""),
        })),
      },
    });
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid comment data", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

// GET - Get comments for a card with cursor-based pagination
export async function GET(
  req: Request,
  { params }: { params: { id: string; cardId: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Parse query parameters
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    
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
    
    // Check if the card exists and belongs to a list in this board
    const card = await prisma.card.findFirst({
      where: {
        id: params.cardId,
        list: {
          boardId: params.id,
        },
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Card not found or does not belong to this board" },
        { status: 404 }
      );
    }
    
    // Fetch comments with cursor-based pagination
    const comments = await prisma.comment.findMany({
      where: {
        cardId: params.cardId,
      },
      take: limit + 1, // Take one more to determine if there are more comments
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
    
    // Check if there are more comments
    const hasMore = comments.length > limit;
    const paginatedComments = hasMore ? comments.slice(0, limit) : comments;
    
    // Get the next cursor
    const nextCursor = hasMore ? paginatedComments[paginatedComments.length - 1].id : null;
    
    return NextResponse.json({
      comments: paginatedComments,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error getting comments:", error);
    return NextResponse.json(
      { error: "Failed to get comments" },
      { status: 500 }
    );
  }
} 