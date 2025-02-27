import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { CalendarCard } from "@/hooks/queries/use-calendar-cards";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all cards with due dates from boards the user has access to
    const cards = await db.card.findMany({
      where: {
        dueDate: {
          not: null,
        },
        list: {
          board: {
            OR: [
              { userId },
              {
                members: {
                  some: {
                    userId,
                  },
                },
              },
            ],
          },
        },
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            board: {
              select: {
                id: true,
                title: true,
                color: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Transform the data to match the CalendarCard interface
    const calendarCards: CalendarCard[] = cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate!,
      completed: card.completed,
      boardId: card.list.board.id,
      boardTitle: card.list.board.title,
      boardColor: card.list.board.color || "#3b82f6", // Default to blue if no color
      listId: card.list.id,
      listTitle: card.list.title,
      assigneeId: card.assignee?.id || null,
      assigneeName: card.assignee?.name || null,
      assigneeImage: card.assignee?.imageUrl || null,
    }));

    return NextResponse.json(calendarCards);
  } catch (error) {
    console.error("[CALENDAR_CARDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 