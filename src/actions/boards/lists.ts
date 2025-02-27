"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Schema for list creation
const createListSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  boardId: z.string().min(1, "Board ID is required"),
});

// Schema for list update
const updateListSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
});

/**
 * Create a new list
 */
export async function createList(data: z.infer<typeof createListSchema>) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Validate data
    const validatedData = createListSchema.parse(data);
    
    // Check if board exists and belongs to user
    const board = await prisma.board.findUnique({
      where: { 
        id: validatedData.boardId,
        userId,
      },
      include: {
        lists: {
          orderBy: {
            order: "desc",
          },
          take: 1,
        },
      },
    });
    
    if (!board) {
      return { success: false, error: "Board not found or unauthorized" };
    }
    
    // Calculate the order for the new list
    const lastOrder = board.lists[0]?.order ?? 0;
    const newOrder = lastOrder + 1;
    
    // Create list
    const list = await prisma.list.create({
      data: {
        title: validatedData.title,
        order: newOrder,
        board: { connect: { id: validatedData.boardId } },
      },
    });
    
    // Revalidate the board path
    revalidatePath(`/board/${validatedData.boardId}`);
    
    return { success: true, data: list };
  } catch (error) {
    console.error("Error creating list:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid list data", 
        details: error.format() 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to create list" 
    };
  }
}

/**
 * Update an existing list
 */
export async function updateList(listId: string, data: z.infer<typeof updateListSchema>) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Validate data
    const validatedData = updateListSchema.parse(data);
    
    // Check if list exists and belongs to user's board
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    });
    
    if (!list) {
      return { success: false, error: "List not found" };
    }
    
    if (list.board.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Update list
    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: {
        title: validatedData.title,
      },
    });
    
    // Revalidate the board path
    revalidatePath(`/board/${list.boardId}`);
    
    return { success: true, data: updatedList };
  } catch (error) {
    console.error("Error updating list:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid list data", 
        details: error.format() 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to update list" 
    };
  }
}

/**
 * Delete a list
 */
export async function deleteList(listId: string) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if list exists and belongs to user's board
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: { board: true },
    });
    
    if (!list) {
      return { success: false, error: "List not found" };
    }
    
    if (list.board.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Delete list (this will cascade delete cards)
    await prisma.list.delete({
      where: { id: listId },
    });
    
    // Revalidate the board path
    revalidatePath(`/board/${list.boardId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting list:", error);
    return { success: false, error: "Failed to delete list" };
  }
}

/**
 * Reorder lists
 */
export async function reorderLists(boardId: string, listIds: string[]) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if board exists and belongs to user
    const board = await prisma.board.findUnique({
      where: { 
        id: boardId,
        userId,
      },
    });
    
    if (!board) {
      return { success: false, error: "Board not found or unauthorized" };
    }
    
    // Update the order of each list
    const updates = listIds.map((listId, index) => 
      prisma.list.update({
        where: { id: listId },
        data: { order: index },
      })
    );
    
    await prisma.$transaction(updates);
    
    // Revalidate the board path
    revalidatePath(`/board/${boardId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error reordering lists:", error);
    return { success: false, error: "Failed to reorder lists" };
  }
} 