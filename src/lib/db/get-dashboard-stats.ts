import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, subWeeks, format, eachDayOfInterval } from "date-fns";

export type DashboardStats = {
  totalBoards: number;
  totalCards: number;
  completionRate: number;
  boardsCreatedLastMonth: number;
  cardsCreatedLastWeek: number;
  taskCompletionData: Array<{
    name: string;
    completed: number;
    pending: number;
  }>;
  boardActivityData: Array<{
    day: string;
    created: number;
    updated: number;
    completed: number;
  }>;
};

/**
 * Get dashboard statistics for a user
 * @param userId The user's Clerk ID
 * @returns Dashboard statistics
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // Get total boards
    const totalBoards = await prisma.board.count({
      where: { userId },
    });

    // Get total cards (tasks)
    const totalCards = await prisma.card.count({
      where: {
        list: {
          board: {
            userId,
          },
        },
      },
    });

    // Get completed cards
    const completedCards = await prisma.card.count({
      where: {
        completed: true,
        list: {
          board: {
            userId,
          },
        },
      },
    });

    // Calculate completion rate
    const completionRate = totalCards > 0 
      ? Math.round((completedCards / totalCards) * 100) 
      : 0;

    // Get boards created in the last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const boardsCreatedLastMonth = await prisma.board.count({
      where: {
        userId,
        createdAt: {
          gte: lastMonth,
        },
      },
    });

    // Get cards created in the last week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const cardsCreatedLastWeek = await prisma.card.count({
      where: {
        list: {
          board: {
            userId,
          },
        },
        createdAt: {
          gte: lastWeek,
        },
      },
    });

    // Get task completion data for the last 4 weeks
    const taskCompletionData = [];
    
    for (let i = 0; i < 4; i++) {
      const endDate = subWeeks(new Date(), i);
      const startDate = subWeeks(endDate, 1);
      
      const completed = await prisma.card.count({
        where: {
          completed: true,
          list: {
            board: {
              userId,
            },
          },
          updatedAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      
      const pending = await prisma.card.count({
        where: {
          completed: false,
          list: {
            board: {
              userId,
            },
          },
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      
      taskCompletionData.unshift({
        name: `Week ${4 - i}`,
        completed,
        pending,
      });
    }

    // Get board activity data for the last week
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    
    const daysOfWeek = eachDayOfInterval({
      start: weekStart,
      end: weekEnd,
    });
    
    const boardActivityData = await Promise.all(
      daysOfWeek.map(async (day) => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        
        // Cards created on this day
        const created = await prisma.card.count({
          where: {
            list: {
              board: {
                userId,
              },
            },
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });
        
        // Cards updated on this day
        const updated = await prisma.activity.count({
          where: {
            userId,
            type: "update_card",
            createdAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });
        
        // Cards completed on this day
        const completed = await prisma.card.count({
          where: {
            completed: true,
            list: {
              board: {
                userId,
              },
            },
            updatedAt: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });
        
        return {
          day: format(day, "EEE"),
          created,
          updated,
          completed,
        };
      })
    );

    return {
      totalBoards,
      totalCards,
      completionRate,
      boardsCreatedLastMonth,
      cardsCreatedLastWeek,
      taskCompletionData,
      boardActivityData,
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw error;
  }
} 