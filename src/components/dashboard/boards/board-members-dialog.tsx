"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserPlus, UserX } from "lucide-react";

import { useBoardMembers } from "@/hooks/queries/use-board-members";

// Form schema for adding a member
const addMemberSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
});

type AddMemberFormValues = z.infer<typeof addMemberSchema>;

interface BoardMembersDialogProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
}

export function BoardMembersDialog({
  boardId,
  isOpen,
  onClose,
  isOwner,
}: BoardMembersDialogProps) {
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  const {
    members,
    isLoading,
    addMember,
    updateMember,
    removeMember,
  } = useBoardMembers(boardId);

  // Form for adding a new member
  const form = useForm<AddMemberFormValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: "",
      role: "EDITOR",
    },
  });

  // Handle form submission
  const onSubmit = async (values: AddMemberFormValues) => {
    try {
      await addMember.mutateAsync(values);
      form.reset();
      setIsAddingMember(false);
    } catch {
      // Error is handled in the mutation
    }
  };

  // Handle role change
  const handleRoleChange = async (memberId: string, newRole: "EDITOR" | "VIEWER") => {
    try {
      await updateMember.mutateAsync({
        memberId,
        data: { role: newRole },
      });
    } catch {
      // Error is handled in the mutation
    }
  };

  // Handle member removal
  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember.mutateAsync(memberId);
    } catch {
      // Error is handled in the mutation
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Board Members</DialogTitle>
          <DialogDescription>
            Manage who has access to this board and what they can do.
          </DialogDescription>
        </DialogHeader>

        {/* Members list */}
        <div className="max-h-[300px] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No members yet. Add members to collaborate on this board.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.imageUrl || ""} />
                      <AvatarFallback>
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            handleRoleChange(
                              member.id,
                              value as "EDITOR" | "VIEWER"
                            )
                          }
                          disabled={updateMember.isPending}
                        >
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EDITOR">Editor</SelectItem>
                            <SelectItem value="VIEWER">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removeMember.isPending}
                        >
                          <UserX className="h-4 w-4" />
                          <span className="sr-only">Remove member</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add member form */}
        {isAddingMember ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email address"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EDITOR">
                          Editor (can edit cards and lists)
                        </SelectItem>
                        <SelectItem value="VIEWER">
                          Viewer (can only view)
                        </SelectItem>
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
                  onClick={() => setIsAddingMember(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addMember.isPending}
                  className="gap-1"
                >
                  {addMember.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Add Member
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          isOwner && (
            <Button
              onClick={() => setIsAddingMember(true)}
              className="w-full gap-1"
            >
              <UserPlus className="h-4 w-4" />
              Add Member
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