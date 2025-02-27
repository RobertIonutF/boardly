import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListWithCards } from "@/lib/db/get-lists";
import {
  createList as createListAction,
  updateList as updateListAction,
  deleteList as deleteListAction,
  reorderLists as reorderListsAction
} from "@/actions/boards/lists";

interface FetchListsResponse {
  lists: ListWithCards[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

export function useBoardLists(boardId: string, page: number = 1, limit: number = 10) {
  const queryClient = useQueryClient();
  const queryKey = ["board-lists", boardId, page, limit];

  // Fetch lists - keep using API route for GET operations
  const { data, isLoading, error } = useQuery<FetchListsResponse>({
    queryKey,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("page", page.toString());
      queryParams.set("limit", limit.toString());

      const response = await fetch(`/api/boards/${boardId}/lists?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch lists");
      }
      return response.json();
    },
    enabled: !!boardId,
  });

  // Create list mutation - use server action
  const createList = useMutation({
    mutationFn: async (listData: { title: string }) => {
      const result = await createListAction({
        title: listData.title,
        boardId,
      });
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create list");
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success("List created successfully");
    },
    onError: () => {
      toast.error("Failed to create list");
    },
  });

  // Update list mutation - use server action
  const updateList = useMutation({
    mutationFn: async ({ listId, title }: { listId: string; title: string }) => {
      const result = await updateListAction(listId, { title });
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update list");
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success("List updated successfully");
    },
    onError: () => {
      toast.error("Failed to update list");
    },
  });

  // Delete list mutation - use server action
  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      const result = await deleteListAction(listId);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete list");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success("List deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete list");
    },
  });

  // Reorder lists mutation - use server action
  const reorderLists = useMutation({
    mutationFn: async (listIds: string[]) => {
      const result = await reorderListsAction(boardId, listIds);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to reorder lists");
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
    },
    onError: () => {
      toast.error("Failed to reorder lists");
    },
  });

  return {
    lists: data?.lists ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    createList,
    updateList,
    deleteList,
    reorderLists,
  };
} 