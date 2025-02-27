"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/queries/use-boards";

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  category: z.string().max(50, "Category is too long").optional(),
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
  "#0ea5e9", // sky
  "#84cc16", // lime
  "#a855f7", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#64748b", // slate
  "#000000", // black
];

interface CreateBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBoard: (data: FormValues) => Promise<unknown>;
  isPending: boolean;
}

export function CreateBoardDialog({
  isOpen,
  onClose,
  onCreateBoard,
  isPending,
}: CreateBoardDialogProps) {
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0]);
  const [customColor, setCustomColor] = useState("");
  const [isCustomColorActive, setIsCustomColorActive] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Fetch categories
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading 
  } = useCategories();

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  const hasCategories = safeCategories.length > 0;

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      color: selectedColor,
    },
  });

  // Handle custom color change
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setSelectedColor(color);
    setIsCustomColorActive(true);
  };

  // Handle preset color selection
  const handlePresetColorSelect = (color: string) => {
    setSelectedColor(color);
    setIsCustomColorActive(false);
  };

  // Handle custom category input
  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    form.setValue("category", value);
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Add the selected color to the form data
      const boardData = {
        ...data,
        color: selectedColor,
        // Ensure category is never empty
        category: data.category || "Uncategorized",
      };

      // Call the mutation function from useBoards hook
      await onCreateBoard(boardData);
      
      // Reset form and close dialog on success
      form.reset();
      setCustomColor("");
      setCustomCategory("");
      setIsCustomColorActive(false);
      onClose();
    } catch (error) {
      // Log error but don't show toast (already handled in the hook)
      console.error("Error creating board:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Board</DialogTitle>
          <DialogDescription>
            Create a new board to organize your tasks and projects.
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
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Category {!hasCategories && "(Optional)"}</FormLabel>
                  <div className="flex flex-col gap-2">
                    {hasCategories && (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          form.setValue("category", value);
                          setCustomCategory("");
                        }}
                        disabled={isCategoriesLoading}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {isCategoriesLoading ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Loading categories...
                            </div>
                          ) : (
                            safeCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    <div>
                      <FormLabel className="text-sm font-normal">
                        {hasCategories ? "Or enter a custom category" : "Enter a category (optional)"}
                      </FormLabel>
                      <Input
                        placeholder="Enter custom category"
                        value={customCategory}
                        onChange={handleCustomCategoryChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
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
              <div className="flex flex-wrap gap-2 mb-3">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full transition-all ${
                      selectedColor === color && !isCustomColorActive
                        ? "ring-2 ring-offset-2 ring-primary"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handlePresetColorSelect(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className={`h-8 w-8 rounded-full transition-all ${
                      isCustomColorActive ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: customColor || "#CCCCCC" }}
                  />
                  <FormLabel className="text-sm font-normal">Custom Color</FormLabel>
                </div>
                <Input
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="h-10 w-full cursor-pointer"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Board"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}