"use client";

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
import { useBoardLists } from "@/hooks/queries/use-board-lists";

// Form schema
const formSchema = z.object({
  title: z.string().min(1, "List title is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddListDialogProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddListDialog({ boardId, isOpen, onClose, onSuccess }: AddListDialogProps) {
  // Use the createList mutation from useBoardLists
  const { createList } = useBoardLists(boardId);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      // Use the createList mutation instead of direct API call
      await createList.mutateAsync({ title: values.title });
      
      // Reset form and close dialog on success
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating list:", error);
      // Error handling is already done in the mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New List</DialogTitle>
          <DialogDescription>
            Create a new list to organize your tasks.
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
                disabled={createList.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createList.isPending}>
                {createList.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create List"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 