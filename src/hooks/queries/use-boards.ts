import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BoardWithStats } from "@/lib/db/get-boards";
import { 
  createBoard as createBoardAction,
  updateBoard as updateBoardAction,
  deleteBoard as deleteBoardAction,
  duplicateBoard as duplicateBoardAction,
  toggleBoardFavorite as toggleBoardFavoriteAction
} from "@/actions/boards";

interface FetchBoardsResponse {
  boards: BoardWithStats[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// Define the type for board update data to match the server action schema
interface BoardUpdateData {
  title?: string;
  description?: string | null;
  imageUrl?: string | null;
  color?: string;
}

// Function to fetch all distinct categories
export function useCategories() {
  return useQuery<string[]>({
    queryKey: ["boardCategories"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/boards/categories");
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data.categories) ? data.categories : [];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return []; // Return empty array on error instead of throwing
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

export function useBoards(page: number = 1, limit: number = 9, search?: string, category?: string, favorites?: boolean) {
  const queryClient = useQueryClient();
  const queryKey = ["boards", page, limit, search, category, favorites];

  // Fetch boards
  const { data, isLoading, error } = useQuery<FetchBoardsResponse>({
    queryKey,
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", page.toString());
        queryParams.set("limit", limit.toString());
        if (search && search.trim() !== "") queryParams.set("search", search);
        if (category && category.trim() !== "") queryParams.set("category", category);
        if (favorites) queryParams.set("favorites", "true");

        const response = await fetch(`/api/boards?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("API Error:", {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
          throw new Error(`Failed to fetch boards: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Create board mutation
  const createBoard = useMutation({
    mutationFn: async (boardData: {
      title: string;
      description?: string;
      imageUrl?: string;
      color?: string;
    }) => {
      const result = await createBoardAction(boardData);
      if (!result.success) {
        throw new Error(result.error || "Failed to create board");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate all board queries regardless of parameters
      queryClient.invalidateQueries({
        queryKey: ["boards"],
        refetchType: 'all',
        exact: false
      });
      toast.success("Board created successfully");
    },
    onError: (error) => {
      console.error("Error creating board:", error);
      toast.error(`Failed to create board: ${error.message || "Unknown error"}`);
    },
  });

  // Update board mutation
  const updateBoard = useMutation({
    mutationFn: async ({
      boardId,
      data,
    }: {
      boardId: string;
      data: Partial<BoardWithStats>;
    }) => {
      // Convert BoardWithStats to the format expected by the server action
      const updateData: BoardUpdateData = {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        color: data.color,
      };
      
      const result = await updateBoardAction(boardId, updateData);
      if (!result.success) {
        throw new Error(result.error || "Failed to update board");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate all board queries regardless of parameters
      queryClient.invalidateQueries({
        queryKey: ["boards"],
        refetchType: 'all',
        exact: false
      });
      toast.success("Board updated successfully");
    },
    onError: (error) => {
      console.error("Error updating board:", error);
      toast.error(`Failed to update board: ${error.message || "Unknown error"}`);
    },
  });

  // Delete board mutation
  const deleteBoard = useMutation({
    mutationFn: async (boardId: string) => {
      const result = await deleteBoardAction(boardId);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete board");
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate all board queries regardless of parameters
      queryClient.invalidateQueries({
        queryKey: ["boards"],
        refetchType: 'all',
        exact: false
      });
      toast.success("Board deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting board:", error);
      toast.error(`Failed to delete board: ${error.message || "Unknown error"}`);
    },
  });

  // Duplicate board mutation
  const duplicateBoard = useMutation({
    mutationFn: async (boardId: string) => {
      const result = await duplicateBoardAction(boardId);
      if (!result.success) {
        throw new Error(result.error || "Failed to duplicate board");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate all board queries regardless of parameters
      queryClient.invalidateQueries({
        queryKey: ["boards"],
        refetchType: 'all',
        exact: false
      });
      toast.success("Board duplicated successfully");
    },
    onError: (error) => {
      console.error("Error duplicating board:", error);
      toast.error(`Failed to duplicate board: ${error.message || "Unknown error"}`);
    },
  });

  // Toggle favorite status mutation
  const toggleFavorite = useMutation({
    mutationFn: async (boardId: string) => {
      const result = await toggleBoardFavoriteAction(boardId);
      if (!result.success) {
        throw new Error(result.error || "Failed to update favorite status");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate all board queries regardless of parameters
      queryClient.invalidateQueries({
        queryKey: ["boards"],
        refetchType: 'all',
        exact: false
      });
    },
    onError: (error) => {
      console.error("Error updating favorite status:", error);
      toast.error(`Failed to update favorite status: ${error.message || "Unknown error"}`);
    },
  });

  return {
    boards: data?.boards ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    createBoard,
    updateBoard,
    deleteBoard,
    duplicateBoard,
    toggleFavorite,
  };
} 