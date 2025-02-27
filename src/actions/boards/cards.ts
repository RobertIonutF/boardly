"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Schema for card creation
const createCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  listId: z.string().min(1, "List ID is required"),
  dueDate: z.date().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  labelIds: z.array(z.string()).optional(),
});

// Schema for card update
const updateCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  labelIds: z.array(z.string()).optional(),
  completed: z.boolean().optional(),
});

/**
 * Create a new card
 */
export async function createCard(data: z.infer<typeof createCardSchema>) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Validate data
    const validatedData = createCardSchema.parse(data);
    
    // Check if list exists and belongs to user's board
    const list = await prisma.list.findUnique({
      where: { id: validatedData.listId },
      include: { 
        board: true,
        cards: {
          orderBy: {
            order: "desc",
          },
          take: 1,
        },
      },
    });
    
    if (!list) {
      return { success: false, error: "List not found" };
    }
    
    if (list.board.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Calculate the order for the new card
    const lastOrder = list.cards[0]?.order ?? 0;
    const newOrder = lastOrder + 1;
    
    // Create card
    const card = await prisma.card.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        order: newOrder,
        dueDate: validatedData.dueDate,
        list: { connect: { id: validatedData.listId } },
        assignee: validatedData.assigneeId 
          ? { connect: { id: validatedData.assigneeId } } 
          : undefined,
        labels: validatedData.labelIds?.length 
          ? { connect: validatedData.labelIds.map(id => ({ id })) } 
          : undefined,
        user: { connect: { id: userId } },
      },
    });
    
    // Revalidate the board path
    revalidatePath(`/board/${list.boardId}`);
    
    return { success: true, data: card };
  } catch (error) {
    console.error("Error creating card:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid card data", 
        details: error.format() 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to create card" 
    };
  }
}

/**
 * Update an existing card
 */
export async function updateCard(cardId: string, data: z.infer<typeof updateCardSchema>) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Validate data
    const validatedData = updateCardSchema.parse(data);
    
    // Check if card exists and belongs to user's board
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { 
        list: {
          include: {
            board: true,
          },
        },
        labels: true,
      },
    });
    
    if (!card) {
      return { success: false, error: "Card not found" };
    }
    
    if (card.list.board.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Prepare update data
    type CardUpdateData = {
      title?: string;
      description?: string | null;
      dueDate?: Date | null;
      completed?: boolean;
      assignee?: { connect: { id: string } } | { disconnect: true };
      labels?: { 
        disconnect: { id: string }[];
        connect?: { id: string }[];
      };
    };

    const updateData: CardUpdateData = {
      title: validatedData.title,
      description: validatedData.description,
      dueDate: validatedData.dueDate,
      completed: validatedData.completed,
    };
    
    // Handle assignee update
    if (validatedData.assigneeId !== undefined) {
      if (validatedData.assigneeId) {
        updateData.assignee = { connect: { id: validatedData.assigneeId } };
      } else {
        updateData.assignee = { disconnect: true };
      }
    }
    
    // Handle labels update
    if (validatedData.labelIds !== undefined) {
      // Disconnect all existing labels
      updateData.labels = {
        disconnect: card.labels.map(label => ({ id: label.id })),
      };
      
      // Connect new labels
      if (validatedData.labelIds.length > 0) {
        updateData.labels = {
          ...updateData.labels,
          connect: validatedData.labelIds.map(id => ({ id })),
        };
      }
    }
    
    // Update card
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: updateData,
    });
    
    // Revalidate the board path
    revalidatePath(`/board/${card.list.boardId}`);
    
    return { success: true, data: updatedCard };
  } catch (error) {
    console.error("Error updating card:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: "Invalid card data", 
        details: error.format() 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to update card" 
    };
  }
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: string) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if card exists and belongs to user's board
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { 
        list: {
          include: {
            board: true,
          },
        },
      },
    });
    
    if (!card) {
      return { success: false, error: "Card not found" };
    }
    
    if (card.list.board.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Delete card
    await prisma.card.delete({
      where: { id: cardId },
    });
    
    // Revalidate the board path
    revalidatePath(`/board/${card.list.boardId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { success: false, error: "Failed to delete card" };
  }
}

/**
 * Toggle card completion
 */
export async function toggleCardCompletion(cardId: string, completed: boolean) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if card exists and belongs to user's board
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { 
        list: {
          include: {
            board: true,
          },
        },
      },
    });
    
    if (!card) {
      return { success: false, error: "Card not found" };
    }
    
    if (card.list.board.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Update card completion status
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: { completed },
    });
    
    // Revalidate the board path
    revalidatePath(`/board/${card.list.boardId}`);
    
    return { success: true, data: updatedCard };
  } catch (error) {
    console.error("Error toggling card completion:", error);
    return { success: false, error: "Failed to toggle card completion" };
  }
}

/**
 * Move card to another list
 */
export async function moveCard(cardId: string, targetListId: string, newOrder: number) {
  try {
    // Get current user
    const { id: userId } = await getCurrentUser();
    
    // Check if card exists and belongs to user's board
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: { 
        list: {
          include: {
            board: true,
          },
        },
      },
    });
    
    if (!card) {
      return { success: false, error: "Card not found" };
    }
    
    if (card.list.board.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if target list exists and belongs to the same board
    const targetList = await prisma.list.findUnique({
      where: { id: targetListId },
      include: { board: true },
    });
    
    if (!targetList) {
      return { success: false, error: "Target list not found" };
    }
    
    if (targetList.boardId !== card.list.boardId) {
      return { success: false, error: "Cannot move card to a different board" };
    }
    
    // Move card to target list with new order
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        listId: targetListId,
        order: newOrder,
      },
    });
    
    // Revalidate the board path
    revalidatePath(`/board/${card.list.boardId}`);
    
    return { success: true, data: updatedCard };
  } catch (error) {
    console.error("Error moving card:", error);
    return { success: false, error: "Failed to move card" };
  }
}

/**
 * Reorder cards within a list
 */
export async function reorderCards(listId: string, cardIds: string[]) {
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
    
    // Update the order of each card
    const updates = cardIds.map((cardId, index) => 
      prisma.card.update({
        where: { id: cardId },
        data: { order: index },
      })
    );
    
    await prisma.$transaction(updates);
    
    // Revalidate the board path
    revalidatePath(`/board/${list.boardId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error reordering cards:", error);
    return { success: false, error: "Failed to reorder cards" };
  }
} 