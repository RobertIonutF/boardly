import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCard as createCardAction,
  updateCard as updateCardAction,
  deleteCard as deleteCardAction,
  toggleCardCompletion as toggleCardCompletionAction,
  moveCard as moveCardAction,
  reorderCards as reorderCardsAction
} from "@/actions/boards/cards";

export function useBoardCards(boardId: string) {
  const queryClient = useQueryClient();

  // Create card mutation - use server action
  const createCard = useMutation({
    mutationFn: async (cardData: {
      title: string;
      description?: string;
      listId: string;
      dueDate?: Date | null;
      assigneeId?: string | null;
      labelIds?: string[];
    }) => {
      const result = await createCardAction(cardData);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create card");
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success("Card created successfully");
    },
    onError: () => {
      toast.error("Failed to create card");
    },
  });

  // Update card mutation - use server action
  const updateCard = useMutation({
    mutationFn: async ({
      cardId,
      data,
    }: {
      cardId: string;
      data: {
        title?: string;
        description?: string | null;
        dueDate?: Date | null;
        assigneeId?: string | null;
        labelIds?: string[];
        completed?: boolean;
      };
    }) => {
      const result = await updateCardAction(cardId, data);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update card");
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success("Card updated successfully");
    },
    onError: () => {
      toast.error("Failed to update card");
    },
  });

  // Delete card mutation - use server action
  const deleteCard = useMutation({
    mutationFn: async (cardId: string) => {
      const result = await deleteCardAction(cardId);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete card");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success("Card deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete card");
    },
  });

  // Toggle card completion mutation - use server action
  const toggleCardCompletion = useMutation({
    mutationFn: async ({ cardId, completed }: { cardId: string; completed: boolean }) => {
      const result = await toggleCardCompletionAction(cardId, completed);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle card completion");
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
    },
    onError: () => {
      toast.error("Failed to update card status");
    },
  });

  // Move card mutation - use server action
  const moveCard = useMutation({
    mutationFn: async ({
      cardId,
      targetListId,
      newOrder,
    }: {
      cardId: string;
      targetListId: string;
      newOrder: number;
    }) => {
      const result = await moveCardAction(cardId, targetListId, newOrder);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to move card");
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
    },
    onError: () => {
      toast.error("Failed to move card");
    },
  });

  // Reorder cards mutation - use server action
  const reorderCards = useMutation({
    mutationFn: async ({ listId, cardIds }: { listId: string; cardIds: string[] }) => {
      const result = await reorderCardsAction(listId, cardIds);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to reorder cards");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
    },
    onError: () => {
      toast.error("Failed to reorder cards");
    },
  });

  return {
    createCard,
    updateCard,
    deleteCard,
    toggleCardCompletion,
    moveCard,
    reorderCards,
  };
} 