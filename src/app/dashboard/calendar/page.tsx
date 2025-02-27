import { CalendarView } from "@/components/dashboard/calendar/calendar-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar | Boardly",
  description: "View all your task deadlines in a calendar view",
};

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
      </div>
      <p className="text-muted-foreground">
        View all your upcoming deadlines in one place.
      </p>
      <CalendarView />
    </div>
  );
} 