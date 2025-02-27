import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Fetch activities for a card
export async function GET(
  request: Request,
  { params }: { params: { id: string; cardId: string } }
) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if board exists and user has access
    const board = await prisma.board.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { error: "Board not found or you don't have access" },
        { status: 404 }
      );
    }
    
    // Check if card exists and belongs to the board
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
        { error: "Card not found" },
        { status: 404 }
      );
    }
    
    // Extract pagination parameters from URL
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    // Fetch activities for the card with pagination
    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { cardId: params.cardId },
          { 
            entityType: "card", 
            entityId: params.cardId 
          }
        ],
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1, // Take one more to check if there are more activities
      ...(cursor && { 
        cursor: { 
          id: cursor 
        },
        skip: 1, // Skip the cursor itself
      }),
    });
    
    // Check if there are more activities
    const hasMore = activities.length > limit;
    
    // Remove the extra activity if there are more
    const paginatedActivities = hasMore ? activities.slice(0, limit) : activities;
    
    // Get the ID of the last activity for the next cursor
    const nextCursor = hasMore ? paginatedActivities[paginatedActivities.length - 1].id : null;
    
    return NextResponse.json({ 
      activities: paginatedActivities,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error("Error fetching card activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
} 