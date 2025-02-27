"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function CalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
      </div>
      <p className="text-muted-foreground">
        View all your upcoming deadlines in one place.
      </p>
      
      <div className="flex items-center justify-center h-[70vh] border rounded-lg">
        <div className="text-center space-y-4 max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Something went wrong!</h2>
          <p className="text-muted-foreground">
            We encountered an error while loading your calendar. Please try again or contact support if the problem persists.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
            <Button onClick={() => reset()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 