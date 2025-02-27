"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  // Create arrays for skeleton data
  const statCards = Array.from({ length: 3 }, (_, i) => i);
  const chartCards = Array.from({ length: 2 }, (_, i) => i);
  
  return (
    <div className="grid gap-6">
      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statCards.map((index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {chartCards.map((index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Activity chart skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
} 