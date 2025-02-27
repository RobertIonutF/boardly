"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useBoards } from "@/hooks/queries/use-boards";
import type { BoardWithStats } from "@/lib/db/get-boards";

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional().nullable(),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Default colors
const BOARD_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
];

interface EditBoardDialogProps {
  board: BoardWithStats;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditBoardDialog({
  board,
  isOpen,
  onClose,
  onSave,
}: EditBoardDialogProps) {
  const { updateBoard } = useBoards();
  const [selectedColor, setSelectedColor] = useState(board.color || BOARD_COLORS[0]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: board.title,
      description: board.description,
      color: board.color || BOARD_COLORS[0],
    },
  });

  // Update form when board changes
  useEffect(() => {
    form.reset({
      title: board.title,
      description: board.description,
      color: board.color || BOARD_COLORS[0],
    });
    setSelectedColor(board.color || BOARD_COLORS[0]);
  }, [board, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Add the selected color to the form data
      const boardData = {
        ...data,
        color: selectedColor,
      };

      await updateBoard.mutateAsync({
        boardId: board.id,
        data: boardData,
      });
      
      onSave();
      toast.success("Board updated successfully");
    } catch (error) {
      console.error("Error updating board:", error);
      toast.error("Failed to update board");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
          <DialogDescription>
            Make changes to your board settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter board title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter board description"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Board Color</FormLabel>
              <div className="flex flex-wrap gap-2">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateBoard.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateBoard.isPending}>
                {updateBoard.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 