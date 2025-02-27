"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar, PlusCircle } from "lucide-react";
import { useBoardCards } from "@/hooks/queries/use-board-cards";

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  listId: string;
  onSuccess: () => void;
}

export interface NewTask {
  title: string;
  description: string;
  dueDate: string | null;
}

export function AddTaskDialog({ 
  isOpen, 
  onClose, 
  boardId,
  listId,
  onSuccess
}: AddTaskDialogProps) {
  const { createCard } = useBoardCards(boardId);
  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    description: "",
    dueDate: null,
  });

  // Reset form when dialog closes
  const handleClose = () => {
    setNewTask({
      title: "",
      description: "",
      dueDate: null,
    });
    onClose();
  };

  // Update task field
  const updateTaskField = <K extends keyof NewTask>(field: K, value: NewTask[K]) => {
    setNewTask({
      ...newTask,
      [field]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) {
      return; // Don't submit if title is empty
    }
    
    createCard.mutate(
      {
        title: newTask.title,
        description: newTask.description,
        listId: listId,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
      },
      {
        onSuccess: () => {
          onSuccess();
          handleClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) => updateTaskField("title", e.target.value)}
              placeholder="Enter card title"
              required
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={newTask.description}
              onChange={(e) => updateTaskField("description", e.target.value)}
              placeholder="Add a more detailed description..."
              className="min-h-[100px]"
            />
          </div>
          
          {/* Due Date */}
          <div className="space-y-2">
            <label htmlFor="dueDate" className="text-sm font-medium">
              Due Date
            </label>
            <div className="flex items-center gap-2">
              <Input 
                id="dueDate"
                type="date" 
                value={newTask.dueDate ? new Date(newTask.dueDate).toISOString().split('T')[0] : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  updateTaskField("dueDate", value ? new Date(value).toISOString() : null);
                }}
                className="flex-1"
              />
              {newTask.dueDate && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => updateTaskField("dueDate", null)}
                >
                  <span className="sr-only">Clear date</span>
                  <Calendar className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={createCard.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!newTask.title.trim() || createCard.isPending}
            >
              {createCard.isPending ? (
                <>Creating...</>
              ) : (
                <>
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Create Card
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 