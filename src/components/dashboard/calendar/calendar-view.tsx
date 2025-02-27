"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isAfter, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { useCalendarCards } from "@/hooks/queries/use-calendar-cards";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { data: cards, isLoading, error } = useCalendarCards();
  
  // Get the days for the current month
  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Navigate to current month
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Group cards by date
  const cardsByDate = useMemo(() => {
    if (!cards) return {};
    
    const grouped: Record<string, typeof cards> = {};
    
    cards.forEach(card => {
      const dateStr = format(new Date(card.dueDate), "yyyy-MM-dd");
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(card);
    });
    
    return grouped;
  }, [cards]);
  
  // Get cards for a specific day
  const getCardsForDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    return cardsByDate[dateStr] || [];
  };
  
  // Check if a day has cards
  const hasCards = (day: Date) => {
    return getCardsForDay(day).length > 0;
  };
  
  // Check if a day has overdue cards
  const hasOverdueCards = (day: Date) => {
    if (!isToday(day) && isBefore(day, new Date())) {
      return getCardsForDay(day).some(card => !card.completed);
    }
    return false;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i + 7} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <h3 className="font-medium">Failed to load calendar</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {error.message || "There was an error loading your calendar. Please try again."}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-3 text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {days.map((day, index) => {
            const dayCards = getCardsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isOverdue = hasOverdueCards(day);
            
            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[120px] p-2 border-r border-b relative",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isToday && "bg-primary/5",
                  index % 7 === 6 && "border-r-0", // Last column
                  Math.floor(index / 7) === Math.floor(days.length / 7) && "border-b-0" // Last row
                )}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday && "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {hasCards(day) && (
                    <Badge 
                      variant={isOverdue ? "destructive" : "secondary"} 
                      className="text-xs"
                    >
                      {dayCards.length}
                    </Badge>
                  )}
                </div>
                
                {/* Cards for this day */}
                {dayCards.length > 0 && (
                  <ScrollArea className="h-[calc(100%-24px)]">
                    <div className="space-y-1">
                      {dayCards.map((card) => (
                        <Link
                          key={card.id}
                          href={`/dashboard/boards/${card.boardId}`}
                          className="block"
                        >
                          <div 
                            className={cn(
                              "text-xs p-1.5 rounded-md hover:bg-accent group relative",
                              card.completed ? "bg-muted/50" : "bg-background",
                              !card.completed && isBefore(new Date(card.dueDate), new Date()) && "border-l-2 border-destructive"
                            )}
                            style={{ 
                              borderLeft: card.completed ? undefined : `2px solid ${card.boardColor}` 
                            }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className={cn(
                                "font-medium line-clamp-1",
                                card.completed && "line-through text-muted-foreground"
                              )}>
                                {card.title}
                              </span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                                {card.boardTitle}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(card.dueDate), "h:mm a")}
                              </div>
                            </div>
                            
                            {card.assigneeId && (
                              <div className="absolute -top-1 -right-1">
                                {card.assigneeImage ? (
                                  <Image
                                    src={card.assigneeImage}
                                    alt={card.assigneeName || "Assignee"}
                                    width={16}
                                    height={16}
                                    className="rounded-full border-2 border-background"
                                  />
                                ) : (
                                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-medium text-primary border-2 border-background">
                                    {card.assigneeName?.[0] || "U"}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {card.completed && (
                              <div className="absolute bottom-1 right-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Upcoming Deadlines */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">Upcoming Deadlines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards
            ?.filter(card => !card.completed && isAfter(new Date(card.dueDate), new Date()))
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3)
            .map(card => (
              <Card key={card.id} className="overflow-hidden">
                <CardHeader className="pb-2" style={{ borderBottom: `2px solid ${card.boardColor}` }}>
                  <CardTitle className="text-base">{card.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(card.dueDate), "PPP 'at' p")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  {card.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {card.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/5">
                      {card.boardTitle}
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/10">
                      {card.listTitle}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <div className="flex items-center gap-2">
                    {card.assigneeId ? (
                      <div className="flex items-center gap-1.5">
                        {card.assigneeImage ? (
                          <Image
                            src={card.assigneeImage}
                            alt={card.assigneeName || "Assignee"}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {card.assigneeName?.[0] || "U"}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {card.assigneeName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/boards/${card.boardId}`}>
                      View Board
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
          {(!cards || cards.filter(card => !card.completed && isAfter(new Date(card.dueDate), new Date())).length === 0) && (
            <div className="col-span-full flex items-center justify-center h-32 border rounded-lg bg-muted/30">
              <div className="text-center space-y-1">
                <h4 className="font-medium">No upcoming deadlines</h4>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any upcoming deadlines. Enjoy your free time!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 