"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { toast } from "sonner";
import { List } from "@prisma/client";

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "List title is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditListDialogProps {
  boardId: string;
  list: List;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditListDialog({ boardId, list, isOpen, onClose, onSuccess }: EditListDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with list data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: list?.title || "",
    },
  });

  // If list is null, close the dialog
  if (!list && isOpen) {
    onClose();
    return null;
  }

  const handleSubmit = async (values: FormValues) => {
    if (!list) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/boards/${boardId}/lists/${list.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update list");
      }

      toast.success("List updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error("Failed to update list");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
          <DialogDescription>
            Update the list details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter list title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 