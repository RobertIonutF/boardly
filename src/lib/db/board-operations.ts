import { prisma } from "@/lib/prisma";

interface CreateBoardData {
  title: string;
  description?: string;
  imageUrl?: string;
  userId: string;
  category?: string;
  color?: string;
}

interface UpdateBoardData {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  category?: string;
  color?: string;
}

/**
 * Creates a new board with default lists
 * @param data Board creation data
 * @returns The created board
 */
export async function createBoard(data: CreateBoardData) {
  try {
    // Create the board with initial lists
    const board = await prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        userId: data.userId,
        category: data.category || "Other",
        color: data.color || "#4f46e5",
        lists: {
          create: [
            { title: "To Do", order: 0 },
            { title: "In Progress", order: 1 },
            { title: "Done", order: 2 },
          ],
        },
      },
      include: {
        lists: true,
      },
    });

    // Create an activity record for the board creation
    await prisma.activity.create({
      data: {
        type: "create_board",
        entityType: "board",
        entityId: board.id,
        userId: data.userId,
        boardId: board.id,
        data: JSON.parse(JSON.stringify({ 
          title: data.title,
          category: data.category || "Other",
          color: data.color || "#4f46e5"
        })),
      },
    });

    return board;
  } catch (error) {
    console.error("Error creating board:", error);
    throw error;
  }
}

/**
 * Updates an existing board
 * @param boardId The ID of the board to update
 * @param userId The user ID of the board owner
 * @param data The data to update
 * @returns The updated board
 */
export async function updateBoard(boardId: string, userId: string, data: UpdateBoardData) {
  try {
    // First check if the board exists and belongs to the user
    const existingBoard = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
    });

    if (!existingBoard) {
      throw new Error("Board not found or you don't have permission to update it");
    }

    // Update the board
    const updatedBoard = await prisma.board.update({
      where: {
        id: boardId,
      },
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        color: data.color,
      },
    });

    // Create an activity record for the board update
    await prisma.activity.create({
      data: {
        type: "update_board",
        entityType: "board",
        entityId: boardId,
        userId,
        boardId,
        data: JSON.parse(JSON.stringify(data)),
      },
    });

    return updatedBoard;
  } catch (error) {
    console.error("Error updating board:", error);
    throw error;
  }
}

/**
 * Deletes a board and all its associated data
 * @param boardId The ID of the board to delete
 * @param userId The user ID of the board owner
 * @returns True if deletion was successful
 */
export async function deleteBoard(boardId: string, userId: string) {
  try {
    // First check if the board exists and belongs to the user
    const existingBoard = await prisma.board.findFirst({
      where: {
        id: boardId,
        userId,
      },
    });

    if (!existingBoard) {
      throw new Error("Board not found or you don't have permission to delete it");
    }

    // Delete the board (cascading delete will handle lists, cards, etc.)
    await prisma.board.delete({
      where: {
        id: boardId,
      },
    });

    return true;
  } catch (error) {
    console.error("Error deleting board:", error);
    throw error;
  }
} 