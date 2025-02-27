"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Copy, Link2, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useBoardShares } from "@/hooks/queries/use-board-shares";

// Form schema for creating a share link
const createShareSchema = z.object({
  expiresInDays: z.coerce.number().int().min(1).max(30),
});

type CreateShareFormValues = z.infer<typeof createShareSchema>;

interface BoardShareDialogProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  canManage: boolean;
}

export function BoardShareDialog({
  boardId,
  isOpen,
  onClose,
  canManage,
}: BoardShareDialogProps) {
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  
  const {
    shareLinks,
    isLoading,
    createShareLink,
    deleteShareLink,
    getShareableUrl,
  } = useBoardShares(boardId);

  // Form for creating a new share link
  const form = useForm<CreateShareFormValues>({
    resolver: zodResolver(createShareSchema),
    defaultValues: {
      expiresInDays: 7,
    },
  });

  // Handle form submission
  const onSubmit = async (values: CreateShareFormValues) => {
    try {
      await createShareLink.mutateAsync(values);
      form.reset();
      setIsCreatingLink(false);
    } catch {
      // Error is handled in the mutation
    }
  };

  // Handle copy link to clipboard
  const handleCopyLink = (token: string) => {
    const url = getShareableUrl(token);
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success("Link copied to clipboard");
      },
      () => {
        toast.error("Failed to copy link");
      }
    );
  };

  // Handle delete share link
  const handleDeleteLink = async (shareId: string) => {
    try {
      await deleteShareLink.mutateAsync(shareId);
    } catch {
      // Error is handled in the mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Board</DialogTitle>
          <DialogDescription>
            Create shareable links to allow others to view this board.
          </DialogDescription>
        </DialogHeader>

        {/* Share links list */}
        <div className="max-h-[300px] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : shareLinks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No share links yet. Create a link to share this board.
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map((shareLink) => (
                <div
                  key={shareLink.id}
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-sm font-medium truncate">
                        {getShareableUrl(shareLink.token).split("/").pop()}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {format(new Date(shareLink.expiresAt), "PPP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyLink(shareLink.token)}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy link</span>
                    </Button>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteLink(shareLink.id)}
                        disabled={deleteShareLink.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete link</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create share link form */}
        {isCreatingLink ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="expiresInDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires after</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select expiration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreatingLink(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createShareLink.isPending}
                  className="gap-1"
                >
                  {createShareLink.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Create Link
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          canManage && (
            <Button
              onClick={() => setIsCreatingLink(true)}
              className="w-full gap-1"
            >
              <Plus className="h-4 w-4" />
              Create Share Link
            </Button>
          )
        )}

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 