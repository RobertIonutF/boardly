import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Board, List } from "@prisma/client";

/**
 * Retrieves all boards for a specific user
 * @param userId The Clerk user ID
 * @returns Array of boards or empty array if none found
 */
export async function getBoardsByUserId(userId: string) {
  try {
    const boards = await prisma.board.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    
    return boards;
  } catch (error) {
    console.error("Error fetching boards:", error);
    return [];
  }
}

/**
 * Retrieves a specific board by ID
 * @param boardId The board ID
 * @param userId Optional user ID to verify ownership
 * @returns The board object or null if not found
 */
export async function getBoardById(boardId: string, userId?: string) {
  try {
    const whereClause: Prisma.BoardWhereInput = {
      id: boardId,
    };
    
    // If userId is provided, ensure the board belongs to this user
    if (userId) {
      whereClause.userId = userId;
    }
    
    const board = await prisma.board.findFirst({
      where: whereClause,
      include: {
        lists: {
          orderBy: {
            order: "asc",
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
        },
      },
    });
    
    return board;
  } catch (error) {
    console.error("Error fetching board:", error);
    return null;
  }
}

export interface BoardWithStats extends Board {
  lists?: List[];
  _count?: {
    lists: number;
    cards: number;
    completedCards: number;
  };
  tasksCount?: number;
  completedTasksCount?: number;
  userId: string;
  archived: boolean;
}

/**
 * Get all boards for a user with optional filtering
 * @param userId The user's Clerk ID
 * @param searchQuery Optional search query to filter boards by title or description
 * @returns Array of boards with task statistics
 */
export async function getAllBoards(userId: string, searchQuery?: string): Promise<BoardWithStats[]> {
  try {
    // Get all boards for the user
    const boards = await prisma.board.findMany({
      where: {
        userId,
        ...(searchQuery
          ? {
              OR: [
                { title: { contains: searchQuery, mode: "insensitive" } },
                { description: { contains: searchQuery, mode: "insensitive" } },
              ],
            }
          : {}),
      },
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
    });

    // Transform the data to include task statistics
    return boards.map((board) => {
      // Count total tasks and completed tasks across all lists
      let tasksCount = 0;
      let completedTasksCount = 0;

      board.lists.forEach((list) => {
        tasksCount += list.cards.length;
        completedTasksCount += list.cards.filter((card) => card.completed).length;
      });

      // Use the board's actual stored color instead of generating one
      // Determine category based on title (in a real app, you'd have a category field)
      // This is just a placeholder implementation
      let category = "Other";
      const title = board.title.toLowerCase();
      
      if (title.includes("work") || title.includes("project") || title.includes("client")) {
        category = "Work";
      } else if (title.includes("personal") || title.includes("home")) {
        category = "Personal";
      } else if (title.includes("study") || title.includes("learn") || title.includes("course")) {
        category = "Study";
      }

      return {
        id: board.id,
        title: board.title,
        description: board.description,
        imageUrl: board.imageUrl,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        category,
        color: board.color,
        tasksCount,
        completedTasksCount,
        userId: board.userId,
        archived: board.archived,
      };
    });
  } catch (error) {
    console.error("Error getting all boards:", error);
    throw error;
  }
} 