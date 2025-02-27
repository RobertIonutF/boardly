import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

// Types
export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: "EDITOR" | "VIEWER";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    imageUrl: string | null;
  };
}

interface AddMemberData {
  email: string;
  role?: "EDITOR" | "VIEWER";
}

interface UpdateMemberData {
  role: "EDITOR" | "VIEWER";
}

/**
 * Hook to manage board members
 */
export function useBoardMembers(boardId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["board-members", boardId];

  // Fetch board members
  const { data: members = [], ...queryResults } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<BoardMember[]>(`/api/boards/${boardId}/members`);
      return response.data;
    },
    enabled: !!boardId,
  });

  // Add a new member
  const addMember = useMutation({
    mutationFn: async (data: AddMemberData) => {
      const response = await axios.post<BoardMember>(`/api/boards/${boardId}/members`, data);
      return response.data;
    },
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${newMember.user.email} added to board`);
    },
    onError: (error: any) => {
      console.error("Failed to add member:", error);
      toast.error(error.response?.data || "Failed to add member");
    },
  });

  // Update a member's role
  const updateMember = useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: UpdateMemberData }) => {
      const response = await axios.patch<BoardMember>(
        `/api/boards/${boardId}/members/${memberId}`,
        data
      );
      return response.data;
    },
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`Updated ${updatedMember.user.email}'s role`);
    },
    onError: (error: any) => {
      console.error("Failed to update member:", error);
      toast.error(error.response?.data || "Failed to update member");
    },
  });

  // Remove a member
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      await axios.delete(`/api/boards/${boardId}/members/${memberId}`);
      return memberId;
    },
    onSuccess: (memberId) => {
      queryClient.invalidateQueries({ queryKey });
      
      // Find the removed member to show in toast
      const removedMember = members.find(member => member.id === memberId);
      if (removedMember) {
        toast.success(`Removed ${removedMember.user.email} from board`);
      } else {
        toast.success("Member removed from board");
      }
    },
    onError: (error: any) => {
      console.error("Failed to remove member:", error);
      toast.error(error.response?.data || "Failed to remove member");
    },
  });

  return {
    members,
    ...queryResults,
    addMember,
    updateMember,
    removeMember,
  };
} 