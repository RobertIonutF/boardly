import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

// Define the card type for calendar view
export interface CalendarCard {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | Date;
  completed: boolean;
  boardId: string;
  boardTitle: string;
  boardColor: string;
  listId: string;
  listTitle: string;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeImage: string | null;
}

// Function to fetch all cards with deadlines
async function fetchCalendarCards(): Promise<CalendarCard[]> {
  try {
    const response = await fetch("/api/calendar/cards");
    
    if (!response.ok) {
      throw new Error("Failed to fetch calendar cards");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching calendar cards:", error);
    throw error;
  }
}

// Hook to use calendar cards
export function useCalendarCards() {
  const query = useQuery<CalendarCard[], Error>({
    queryKey: ["calendar-cards"],
    queryFn: fetchCalendarCards,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
  
  // Handle errors with useEffect
  useEffect(() => {
    if (query.error) {
      toast.error(`Failed to load calendar: ${query.error.message}`);
    }
  }, [query.error]);
  
  return query;
} 