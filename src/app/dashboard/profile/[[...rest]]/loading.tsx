"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      {/* Profile header skeleton */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        
        <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      
      {/* User profile skeleton */}
      <Card className="rounded-lg border bg-card p-6">
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-40 mx-auto" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </Card>
    </div>
  );
} 