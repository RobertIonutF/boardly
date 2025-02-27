"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createBoard as dbCreateBoard } from "@/lib/db/board-operations";

// Schema for board creation
const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  color: z.string().optional(),
});

// Schema for board update
const updateBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  color: z.string().optional(),
});

/**
 * Create a new board
 */
export async function createBoard(data: z.infer<typeof createBoardSchema>) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Validate data
    const validatedData = createBoardSchema.parse(data);
    
    // Create board
    const board = await dbCreateBoard({
      title: validatedData.title,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl || undefined,
      color: validatedData.color,
      userId,
    });
    
    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/boards");
    
    return { success: true, data: board };
  } catch (error) {
    console.error("Error creating board:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid board data", 
        details: error.format() 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to create board" 
    };
  }
}

/**
 * Update an existing board
 */
export async function updateBoard(boardId: string, data: z.infer<typeof updateBoardSchema>) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Validate data
    const validatedData = updateBoardSchema.parse(data);
    
    // Check if board exists and belongs to user
    const existingBoard = await prisma.board.findUnique({
      where: { id: boardId },
    });
    
    if (!existingBoard) {
      return { success: false, error: "Board not found" };
    }
    
    if (existingBoard.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Update board
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: validatedData,
    });
    
    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/boards");
    revalidatePath(`/board/${boardId}`);
    
    return { success: true, data: updatedBoard };
  } catch (error) {
    console.error("Error updating board:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid board data", 
        details: error.format() 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to update board" 
    };
  }
}

/**
 * Delete a board
 */
export async function deleteBoard(boardId: string) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if board exists and belongs to user
    const existingBoard = await prisma.board.findUnique({
      where: { id: boardId },
    });
    
    if (!existingBoard) {
      return { success: false, error: "Board not found" };
    }
    
    if (existingBoard.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Delete board (this will cascade delete lists and cards)
    await prisma.board.delete({
      where: { id: boardId },
    });
    
    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/boards");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting board:", error);
    return { success: false, error: "Failed to delete board" };
  }
}

/**
 * Duplicate a board
 */
export async function duplicateBoard(boardId: string) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if board exists and belongs to user
    const existingBoard = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        lists: {
          include: {
            cards: {
              include: {
                labels: true,
                assignee: true,
              },
            },
          },
        },
      },
    });
    
    if (!existingBoard) {
      return { success: false, error: "Board not found" };
    }
    
    if (existingBoard.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Create a new board with the same properties
    const newBoard = await prisma.board.create({
      data: {
        title: `${existingBoard.title} (Copy)`,
        description: existingBoard.description,
        imageUrl: existingBoard.imageUrl,
        color: existingBoard.color,
        userId,
      },
    });
    
    // Duplicate lists and cards
    for (const list of existingBoard.lists) {
      const newList = await prisma.list.create({
        data: {
          title: list.title,
          order: list.order,
          board: { connect: { id: newBoard.id } },
        },
      });
      
      // Duplicate cards for this list
      for (const card of list.cards) {
        const newCard = await prisma.card.create({
          data: {
            title: card.title,
            description: card.description,
            order: card.order,
            completed: card.completed,
            dueDate: card.dueDate,
            list: { connect: { id: newList.id } },
            assignee: card.assignee ? { connect: { id: card.assignee.id } } : undefined,
            user: { connect: { id: userId } },
          },
        });
        
        // Duplicate labels for this card
        if (card.labels.length > 0) {
          await prisma.card.update({
            where: { id: newCard.id },
            data: {
              labels: {
                connect: card.labels.map(label => ({ id: label.id })),
              },
            },
          });
        }
      }
    }
    
    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/boards");
    
    return { success: true, data: newBoard };
  } catch (error) {
    console.error("Error duplicating board:", error);
    return { success: false, error: "Failed to duplicate board" };
  }
}

/**
 * Toggle the favorite status of a board
 */
export async function toggleBoardFavorite(boardId: string) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if board exists and belongs to user
    const existingBoard = await prisma.board.findUnique({
      where: { id: boardId },
    });
    
    if (!existingBoard) {
      return { success: false, error: "Board not found" };
    }
    
    if (existingBoard.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Toggle the isFavorite status
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { isFavorite: !existingBoard.isFavorite },
    });
    
    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/boards");
    revalidatePath(`/board/${boardId}`);
    
    return { success: true, data: updatedBoard };
  } catch (error) {
    console.error("Error toggling board favorite status:", error);
    return { success: false, error: "Failed to update board favorite status" };
  }
} 