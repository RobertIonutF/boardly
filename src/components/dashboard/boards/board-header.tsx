"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  ArrowLeft, 
  Star, 
  Clock,
  Pencil,
  Copy,
  Trash2,
  UserPlus,
  Link2,
  CheckCircle2,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { List, Activity } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useBoards } from "@/hooks/queries/use-boards";
import { EditBoardDialog } from "./edit-board-dialog";
import { BoardMembersDialog } from "./board-members-dialog";
import { BoardShareDialog } from "./board-share-dialog";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import type { BoardWithStats } from "@/lib/db/get-boards";

// Define the board data type
export interface BoardData {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalCards: number;
  completedCards: number;
  completionPercentage: number;
  lists: List[];
  activities: Activity[];
  color?: string;
  userId: string;
  archived: boolean;
  imageUrl: string | null;
  category: string | null;
  isFavorite: boolean;
}

interface BoardHeaderProps {
  boardData: BoardData;
}

export function BoardHeader({ boardData }: BoardHeaderProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const { deleteBoard, duplicateBoard, toggleFavorite } = useBoards();
  const [isStarred, setIsStarred] = useState(boardData.isFavorite);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  // Handle both Date objects and string dates
  const updatedAt = boardData.updatedAt instanceof Date 
    ? boardData.updatedAt 
    : new Date(boardData.updatedAt);
    
  const formattedDate = updatedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Use the board's actual color with alpha for the background
  const color = boardData.color || "#3b82f6";
  
  // Create background style with subtle gradient
  const headerStyle = {
    background: `linear-gradient(135deg, ${color}15, ${color}30)`,
    borderBottom: `2px solid ${color}30`,
  };

  // Determine category from boardData
  const category = boardData.category || "Uncategorized";

  // Check if current user is the board owner
  const isOwner = userId === boardData.userId;

  // Handle board actions
  const handleEditBoard = () => {
    setIsEditDialogOpen(true);
  };

  const handleDuplicateBoard = async () => {
    try {
      await duplicateBoard.mutateAsync(boardData.id);
      toast.success("Board duplicated successfully");
    } catch (error) {
      toast.error("Failed to duplicate board");
      console.error("Error duplicating board:", error);
    }
  };

  const handleDeleteBoard = async () => {
    try {
      await deleteBoard.mutateAsync(boardData.id);
      toast.success("Board deleted successfully");
      router.push("/dashboard/boards");
    } catch (error) {
      toast.error("Failed to delete board");
      console.error("Error deleting board:", error);
    }
  };

  const handleManageMembers = () => {
    setIsMembersDialogOpen(true);
  };

  const handleShareBoard = () => {
    setIsShareDialogOpen(true);
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite.mutateAsync(boardData.id);
      setIsStarred(!isStarred);
      toast.success(isStarred ? "Board removed from favorites" : "Board added to favorites");
    } catch (error) {
      toast.error("Failed to update favorite status");
      console.error("Error updating favorite status:", error);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-border/50" style={headerStyle}>
      {/* Top navigation bar */}
      <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  asChild 
                  className="h-8 w-8 rounded-full bg-background/80 hover:bg-background/90"
                >
                  <Link href="/dashboard/boards">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to boards</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to boards</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Badge 
            variant="outline" 
            className="rounded-md border-1 px-2 py-1 text-xs font-medium bg-background/80 backdrop-blur-sm"
            style={{ borderColor: color, color }}
          >
            {category}
          </Badge>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated {formattedDate}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm",
                    isStarred && "bg-yellow-100 hover:bg-yellow-200"
                  )}
                  onClick={handleToggleFavorite}
                  disabled={toggleFavorite.isPending}
                >
                  <Star className={cn("h-4 w-4", isStarred ? "fill-yellow-400 text-yellow-400" : "")} />
                  <span className="sr-only">{isStarred ? 'Unstar' : 'Star'}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isStarred ? 'Unstar' : 'Star'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8 bg-background/80 backdrop-blur-sm border-background/20"
                  onClick={handleManageMembers}
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="sr-only">Manage Members</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Manage Members</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8 bg-background/80 backdrop-blur-sm border-background/20"
                  onClick={handleShareBoard}
                >
                  <Link2 className="h-4 w-4" />
                  <span className="sr-only">Share Board</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share Board</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Board Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isOwner && (
                <DropdownMenuItem onClick={handleEditBoard}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Board
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDuplicateBoard}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Board
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isOwner && (
                <DropdownMenuItem 
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Board
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Board title and description */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: `${color}` }}
          >
            {boardData.title}
          </h1>
          {boardData.description && (
            <p className="text-muted-foreground mb-6 max-w-2xl">
              {boardData.description}
            </p>
          )}
          
          {/* Board stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 border border-border/50">
              <div className="rounded-full p-2" style={{ backgroundColor: `${color}20` }}>
                <Layers className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
                <div className="text-2xl font-semibold">{boardData.totalCards}</div>
              </div>
            </div>
            
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3 border border-border/50">
              <div className="rounded-full p-2" style={{ backgroundColor: `${color}20` }}>
                <CheckCircle2 className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-semibold">{boardData.completedCards}</div>
              </div>
            </div>
            
            <div className="col-span-2 bg-background/80 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-muted-foreground">Progress</div>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-normal text-xs",
                    boardData.completionPercentage === 100 ? "bg-green-100 text-green-700 border-green-200" :
                    boardData.completionPercentage > 0 ? "bg-amber-100 text-amber-700 border-amber-200" :
                    "bg-blue-100 text-blue-700 border-blue-200"
                  )}
                >
                  {boardData.completionPercentage === 100 ? "Completed" : 
                   boardData.completionPercentage > 0 ? "In Progress" : "Not Started"}
                </Badge>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/50">
                <div 
                  className={cn(
                    "absolute left-0 top-0 h-full transition-all",
                    boardData.completionPercentage === 100 ? "bg-green-500" :
                    boardData.completionPercentage > 0 ? "bg-amber-500" : "bg-blue-500"
                  )}
                  style={{ width: `${boardData.completionPercentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right mt-1">
                {boardData.completionPercentage}% complete
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Board Dialog */}
      {isEditDialogOpen && (
        <EditBoardDialog
          board={boardData as unknown as BoardWithStats}
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
      
      {/* Board Members Dialog */}
      {isMembersDialogOpen && (
        <BoardMembersDialog
          boardId={boardData.id}
          isOpen={isMembersDialogOpen}
          onClose={() => setIsMembersDialogOpen(false)}
          isOwner={isOwner}
        />
      )}
      
      {/* Board Share Dialog */}
      {isShareDialogOpen && (
        <BoardShareDialog
          boardId={boardData.id}
          isOpen={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          canManage={isOwner}
        />
      )}
    </div>
  );
} 