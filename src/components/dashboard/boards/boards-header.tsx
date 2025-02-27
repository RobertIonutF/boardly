"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { AddBoardDialog } from "./add-board-dialog";

export function BoardsHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Boards</h1>
        <p className="text-muted-foreground">
          Create and manage your boards to organize your tasks and projects.
        </p>
      </div>
      <Button 
        className="w-full sm:w-auto" 
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Board
      </Button>
      
      <AddBoardDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
} 