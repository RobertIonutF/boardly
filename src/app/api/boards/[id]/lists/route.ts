import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Schema for GET request query parameters
const getQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(5),
});

// Schema for creating a new list
const createListSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
});

// POST - Create a new list
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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
        { error: "Board not found" },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const validatedData = createListSchema.parse(body);
    
    // Get the highest order value to place the new list at the end
    const highestOrderList = await prisma.list.findFirst({
      where: {
        boardId: params.id,
      },
      orderBy: {
        order: "desc",
      },
    });
    
    const newOrder = highestOrderList ? highestOrderList.order + 1 : 0;
    
    // Create the list
    const list = await prisma.list.create({
      data: {
        title: validatedData.title,
        boardId: params.id,
        order: newOrder,
      },
    });
    
    // Create an activity record for the list creation
    await prisma.activity.create({
      data: {
        type: "create_list",
        entityType: "list",
        entityId: list.id,
        userId,
        boardId: params.id,
        data: JSON.parse(JSON.stringify({ title: validatedData.title })),
      },
    });
    
    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error("Error creating list:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid list data", details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}

// GET - Get all lists for a board
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Parse query parameters
    const url = new URL(request.url);
    const parsed = getQuerySchema.safeParse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    });
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Check if board exists and belongs to the user
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
    
    // Get total count for pagination
    const totalCount = await prisma.list.count({
      where: {
        boardId: params.id,
      },
    });
    
    // Get paginated lists with their cards
    const lists = await prisma.list.findMany({
      where: {
        boardId: params.id,
      },
      include: {
        cards: {
          orderBy: {
            order: "asc",
          },
          include: {
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
      orderBy: {
        order: "asc",
      },
      skip,
      take: limit,
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      lists,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
} 