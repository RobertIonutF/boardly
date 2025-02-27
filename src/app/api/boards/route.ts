import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createBoard } from "@/lib/db/board-operations";

// Schema for board creation
const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  color: z.string().optional(),
});

// Schema for GET request query parameters
const getQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(9),
  search: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  favorites: z.enum(["true", "false"]).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Parse request body
    const body = await req.json();
    const validatedData = createBoardSchema.parse(body);
    
    // Create board
    const board = await createBoard({
      title: validatedData.title,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl || undefined,
      color: validatedData.color,
      userId,
    });
    
    return NextResponse.json(board);
  } catch (error) {
    console.error("Error creating board:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid board data", details: error.format() },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      console.error("Authentication error: No user found in GET /api/boards");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = currentUser.id;
    console.log(`Fetching boards for user: ${userId}`);
    
    // Parse query parameters
    const url = new URL(request.url);
    const searchParam = url.searchParams.get("search");
    const categoryParam = url.searchParams.get("category");
    const favoritesParam = url.searchParams.get("favorites");
    
    const parsed = getQuerySchema.safeParse({
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
      search: searchParam === null ? undefined : searchParam,
      category: categoryParam === null ? undefined : categoryParam,
      favorites: favoritesParam,
    });
    
    if (!parsed.success) {
      console.error("Invalid query parameters:", parsed.error.format());
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { page, limit, search, category, favorites } = parsed.data;
    const skip = (page - 1) * limit;
    
    // Build the where clause
    const whereClause: Prisma.BoardWhereInput = {
      userId,
    };
    
    // Add search condition if provided
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
        { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      ];
    }
    
    // Add category filter if provided
    if (category) {
      whereClause.category = {
        equals: category,
        mode: 'insensitive' as Prisma.QueryMode
      };
    }
    
    // Add favorites filter if provided
    if (favorites === "true") {
      whereClause.isFavorite = true;
    }
    
    // Get total count for pagination
    const totalCount = await prisma.board.count({
      where: whereClause,
    });
    
    console.log(`Found ${totalCount} total boards for user ${userId}`);
    
    // Get paginated boards
    const boards = await prisma.board.findMany({
      where: whereClause,
      include: {
        lists: {
          include: {
            cards: {
              select: {
                id: true,
                completed: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    });
    
    console.log(`Fetched ${boards.length} boards for page ${page}`);
    
    // Transform the data to include task statistics
    const transformedBoards = boards.map((board) => {
      // Count total tasks and completed tasks across all lists
      let tasksCount = 0;
      let completedTasksCount = 0;

      board.lists.forEach((list) => {
        tasksCount += list.cards.length;
        completedTasksCount += list.cards.filter((card) => card.completed).length;
      });

      // Get the category from the board and capitalize the first letter
      const category = board.category || "Other";
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

      return {
        id: board.id,
        title: board.title,
        description: board.description,
        imageUrl: board.imageUrl,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        category: formattedCategory,
        color: board.color,
        tasksCount,
        completedTasksCount,
        userId: board.userId,
        archived: board.archived,
        isFavorite: board.isFavorite,
      };
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    
    const response = {
      boards: transformedBoards,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 