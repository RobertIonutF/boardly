import { prisma } from "@/lib/prisma";

/**
 * Get recent boards for a user
 * @param userId The user's Clerk ID
 * @param limit The maximum number of boards to return
 * @returns Array of recent boards
 */
export async function getRecentBoards(userId: string, limit: number = 5) {
  try {
    const recentBoards = await prisma.board.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: limit,
      include: {
        lists: {
          include: {
            _count: {
              select: {
                cards: true,
              },
            },
          },
        },
        _count: {
          select: {
            lists: true,
          },
        },
      },
    });

    return recentBoards.map(board => ({
      id: board.id,
      title: board.title,
      description: board.description,
      imageUrl: board.imageUrl,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      listCount: board._count.lists,
      cardCount: board.lists.reduce((acc, list) => acc + list._count.cards, 0),
    }));
  } catch (error) {
    console.error("Error getting recent boards:", error);
    throw error;
  }
} 