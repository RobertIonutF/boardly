import { prisma } from "@/lib/prisma";

/**
 * Get detailed board information including lists and cards
 * @param boardId The ID of the board to retrieve
 * @param userId The user's Clerk ID to verify ownership
 * @returns The board with lists and cards or null if not found
 */
export async function getBoardDetail(boardId: string, userId: string) {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
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
        activities: {
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!board) {
      return null;
    }

    // Calculate board statistics
    let totalCards = 0;
    let completedCards = 0;

    board.lists.forEach((list) => {
      totalCards += list.cards.length;
      completedCards += list.cards.filter((card) => card.completed).length;
    });

    // Transform the data to include additional information
    return {
      ...board,
      totalCards,
      completedCards,
      completionPercentage: totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0,
    };
  } catch (error) {
    console.error("Error fetching board detail:", error);
    return null;
  }
} 