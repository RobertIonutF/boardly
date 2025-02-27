import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

// Types
export interface BoardShare {
  id: string;
  boardId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

interface CreateShareData {
  expiresInDays?: number;
}

/**
 * Hook to manage board share links
 */
export function useBoardShares(boardId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["board-shares", boardId];

  // Fetch board share links
  const { data: shareLinks = [], ...queryResults } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<BoardShare[]>(`/api/boards/${boardId}/share`);
      return response.data;
    },
    enabled: !!boardId,
  });

  // Create a new share link
  const createShareLink = useMutation({
    mutationFn: async (data: CreateShareData = {}) => {
      const response = await axios.post<BoardShare>(`/api/boards/${boardId}/share`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Share link created successfully");
    },
    onError: (error: Error) => {
      console.error("Failed to create share link:", error);
      toast.error("Failed to create share link");
    },
  });

  // Delete a share link
  const deleteShareLink = useMutation({
    mutationFn: async (shareId: string) => {
      await axios.delete(`/api/boards/${boardId}/share/${shareId}`);
      return shareId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Share link revoked");
    },
    onError: (error: Error) => {
      console.error("Failed to delete share link:", error);
      toast.error("Failed to revoke share link");
    },
  });

  // Generate a shareable URL from a token
  const getShareableUrl = (token: string) => {
    return `${window.location.origin}/shared/boards/${token}`;
  };

  return {
    shareLinks,
    ...queryResults,
    createShareLink,
    deleteShareLink,
    getShareableUrl,
  };
} 