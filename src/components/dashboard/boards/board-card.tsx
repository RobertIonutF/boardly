"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, MoreHorizontal, Pencil, Trash, Clock, CheckCircle2, Star, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditBoardDialog } from "./edit-board-dialog";
import { Badge } from "@/components/ui/badge";
import type { BoardWithStats } from "@/lib/db/get-boards";
import { useBoards } from "@/hooks/queries/use-boards";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface BoardCardProps {
  board: BoardWithStats;
}

export function BoardCard({ board }: BoardCardProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { deleteBoard, duplicateBoard, toggleFavorite } = useBoards();

  // Calculate completion percentage
  const completionPercentage = board.tasksCount && board.completedTasksCount
    ? Math.round((board.completedTasksCount / board.tasksCount) * 100)
    : 0;

  // Format the updated date
  const updatedAt = board.updatedAt instanceof Date 
    ? board.updatedAt 
    : new Date(board.updatedAt);
  const formattedDate = formatDistanceToNow(updatedAt, { addSuffix: true });

  // Handle board duplication
  const handleDuplicateBoard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateBoard.mutateAsync(board.id);
  };

  // Handle board deletion
  const handleDeleteBoard = async () => {
    await deleteBoard.mutateAsync(board.id);
    setIsDeleteDialogOpen(false);
  };

  // Handle card click to navigate
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on dropdown or its children
    if ((e.target as HTMLElement).closest('[data-dropdown="true"]')) {
      return;
    }
    router.push(`/dashboard/boards/${board.id}`);
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite.mutateAsync(board.id);
  };

  // Determine status color based on completion percentage
  const getStatusColor = () => {
    if (completionPercentage === 100) return "bg-green-500";
    if (completionPercentage > 0) return "bg-amber-500";
    return "bg-blue-500";
  };

  // Get the status color for styling
  const statusColor = getStatusColor();
  
  // Get status text
  const getStatusText = () => {
    if (completionPercentage === 100) return "Completed";
    if (completionPercentage > 0) return "In Progress";
    return "Not Started";
  };

  // Get background gradient based on board color
  const getBgGradient = () => {
    const color = board.color || '#3b82f6';
    return `linear-gradient(135deg, ${color}10, ${color}25)`;
  };

  return (
    <>
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 border hover:border-primary/50",
          isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        style={{
          background: getBgGradient(),
          borderTop: `3px solid ${board.color || '#3b82f6'}`,
        }}
      >
        {/* Favorite button - always visible on hover or if favorited */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-2 top-2 h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full transition-opacity duration-200",
            !board.isFavorite && !isHovered ? "opacity-0" : "opacity-100"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(e);
          }}
          data-dropdown="true"
        >
          <Star className={cn("h-4 w-4", board.isFavorite && "fill-yellow-400 text-yellow-400")} />
          <span className="sr-only">{board.isFavorite ? 'Unstar' : 'Star'}</span>
        </Button>

        {/* Category badge */}
        <div className="absolute right-2 top-2">
          <Badge 
            variant="outline" 
            className="bg-background/80 backdrop-blur-sm border-0 font-medium"
            style={{ color: board.color || '#3b82f6' }}
          >
            {board.category}
          </Badge>
        </div>

        <CardHeader className="space-y-2 pt-10">
          <CardTitle className="line-clamp-1 text-xl font-bold cursor-pointer transition-colors">
            {board.title}
          </CardTitle>
          {board.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {board.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-md bg-background/50 p-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{board.tasksCount || 0}</div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-background/50 p-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{board.completedTasksCount || 0}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-normal text-xs",
                  completionPercentage === 100 ? "bg-green-100 text-green-700 border-green-200" :
                  completionPercentage > 0 ? "bg-amber-100 text-amber-700 border-amber-200" :
                  "bg-blue-100 text-blue-700 border-blue-200"
                )}
              >
                {getStatusText()}
              </Badge>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/50">
              <div 
                className={`absolute left-0 top-0 h-full ${statusColor} transition-all`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {completionPercentage}% complete
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t bg-background/40 backdrop-blur-sm">
          <div className="flex w-full items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild data-dropdown="true">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" data-dropdown="true">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(e);
                  }}>
                    <Star className={cn("mr-2 h-4 w-4", board.isFavorite && "fill-yellow-400 text-yellow-400")} />
                    {board.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setIsEditDialogOpen(true);
                  }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateBoard(e);
                  }}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Edit Board Dialog */}
      {isEditDialogOpen && (
        <EditBoardDialog
          board={board}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={() => setIsEditDialogOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the board
              and all of its data including lists and tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBoard.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBoard}
              disabled={deleteBoard.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBoard.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 