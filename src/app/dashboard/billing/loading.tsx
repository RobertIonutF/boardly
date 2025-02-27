"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function BillingLoading() {
  // Create arrays for skeleton data
  const planCards = Array.from({ length: 3 }, (_, i) => i);
  
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      
      {/* Current plan skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-[1px] w-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full max-w-md" />
            <Skeleton className="h-5 w-full max-w-sm" />
          </div>
        </CardContent>
      </Card>
      
      {/* Plans skeleton */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {planCards.map((index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-1" />
                <div className="flex items-baseline gap-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="mt-6 space-y-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Billing history skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 