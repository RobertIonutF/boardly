"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Edit,
  Trash,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Task status types
type TaskStatus = "todo" | "in-progress" | "review" | "done";

// Task priority types
type TaskPriority = "low" | "medium" | "high";

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignee: {
    id: string;
    name: string;
    avatar: string | null;
    initials: string;
  } | null;
  commentsCount: number;
  attachmentsCount: number;
  createdAt: string;
}

// Comment interface
interface CommentWithUser {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

// Comments pagination response interface
interface CommentsPaginationResponse {
  comments: CommentWithUser[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Activity interface
interface ActivityWithUser {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  createdAt: string;
  user: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

// Activities pagination response interface
interface ActivitiesPaginationResponse {
  activities: ActivityWithUser[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Column configuration
const COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

// Priority configuration
const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-blue-500" },
  medium: { label: "Medium", color: "bg-yellow-500" },
  high: { label: "High", color: "bg-red-500" },
};

interface TaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export function TaskDialog({ task, isOpen, onClose, boardId }: TaskDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [activeTab, setActiveTab] = useState<"details" | "activity">("details");
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [activities, setActivities] = useState<ActivityWithUser[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [isLoadingMoreActivities, setIsLoadingMoreActivities] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [activitiesNextCursor, setActivitiesNextCursor] = useState<string | null>(null);
  const [hasMoreActivities, setHasMoreActivities] = useState(false);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const activitiesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const activitiesScrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch comments from the API - wrap with useCallback
  const fetchComments = useCallback(async (cursor?: string) => {
    if (!task) return;
    
    if (cursor) {
      setIsLoadingMoreComments(true);
    } else {
      setIsLoadingComments(true);
      setComments([]);
    }
    
    try {
      const url = new URL(`/api/boards/${boardId}/cards/${task.id}/comments`, window.location.origin);
      
      if (cursor) {
        url.searchParams.append("cursor", cursor);
      }
      
      url.searchParams.append("limit", "10");
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      
      const data: CommentsPaginationResponse = await response.json();
      
      if (cursor) {
        setComments(prevComments => [...prevComments, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      
      setNextCursor(data.nextCursor);
      setHasMoreComments(data.hasMore);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      if (cursor) {
        setIsLoadingMoreComments(false);
      } else {
        setIsLoadingComments(false);
      }
    }
  }, [task, boardId]);

  // Fetch activities from the API with cursor-based pagination
  const fetchActivities = useCallback(async (cursor?: string) => {
    if (!task) return;
    
    if (cursor) {
      setIsLoadingMoreActivities(true);
    } else {
      setIsLoadingActivities(true);
      setActivities([]);
    }
    
    try {
      const url = new URL(`/api/boards/${boardId}/cards/${task.id}/activities`, window.location.origin);
      
      if (cursor) {
        url.searchParams.append("cursor", cursor);
      }
      
      url.searchParams.append("limit", "10");
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      
      const data: ActivitiesPaginationResponse = await response.json();
      
      if (cursor) {
        setActivities(prevActivities => [...prevActivities, ...data.activities]);
      } else {
        setActivities(data.activities);
      }
      
      setActivitiesNextCursor(data.nextCursor);
      setHasMoreActivities(data.hasMore);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to load activities");
    } finally {
      if (cursor) {
        setIsLoadingMoreActivities(false);
      } else {
        setIsLoadingActivities(false);
      }
    }
  }, [task, boardId]);

  // Fetch comments when the dialog opens
  useEffect(() => {
    if (isOpen && task) {
      fetchComments();
      if (activeTab === "activity") {
        fetchActivities();
      }
    } else {
      // Reset state when dialog closes
      setComments([]);
      setActivities([]);
      setNextCursor(null);
      setHasMoreComments(false);
    }
  }, [isOpen, task, fetchComments, fetchActivities, activeTab]);

  // Fetch activities when switching to activity tab
  useEffect(() => {
    if (isOpen && task && activeTab === "activity") {
      fetchActivities();
    }
  }, [activeTab, isOpen, task, fetchActivities]);

  // Load more comments when user scrolls to the bottom
  const handleLoadMoreComments = () => {
    if (hasMoreComments && nextCursor && !isLoadingMoreComments) {
      fetchComments(nextCursor);
    }
  };

  // Load more activities when user scrolls to the bottom
  const handleLoadMoreActivities = () => {
    if (hasMoreActivities && activitiesNextCursor && !isLoadingMoreActivities) {
      fetchActivities(activitiesNextCursor);
    }
  };

  // Add a new comment
  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${task.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      
      const addedComment = await response.json();
      setComments([addedComment, ...comments]);
      setNewComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!task) return;
    
    setIsDeletingComment(true);
    
    try {
      const response = await fetch(`/api/boards/${boardId}/cards/${task.id}/comments/${commentId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }
      
      // Remove the deleted comment from the state
      setComments(comments.filter(comment => comment.id !== commentId));
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    } finally {
      setIsDeletingComment(false);
    }
  };

  // Format relative time for comments
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Handle dialog close
  const handleClose = () => {
    setIsEditing(false);
    setActiveTab("details");
    onClose();
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Check if a task is overdue
  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    
    return taskDueDate < today;
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Save changes logic would go here
      setIsEditing(false);
    } else {
      setEditedTask(task);
      setIsEditing(true);
    }
  };

  // Update task field
  const updateTaskField = <K extends keyof Task>(field: K, value: Task[K]) => {
    if (!editedTask) return;
    
    setEditedTask({
      ...editedTask,
      [field]: value,
    });
  };

  // Scroll to the bottom when new comments are loaded
  useEffect(() => {
    if (commentsEndRef.current && !isLoadingMoreComments && hasMoreComments) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isLoadingMoreComments, hasMoreComments]);

  // Scroll to the bottom when new activities are loaded
  useEffect(() => {
    if (activitiesEndRef.current && !isLoadingMoreActivities && hasMoreActivities) {
      activitiesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activities, isLoadingMoreActivities, hasMoreActivities]);

  // Format activity message
  const formatActivityMessage = (activity: ActivityWithUser) => {
    const { type, data } = activity;
    
    switch (type) {
      case "create_card":
        return "created this card";
      case "update_card":
        if (data.title) {
          return `updated the title to "${String(data.title)}"`;
        }
        if (data.description !== undefined) {
          return data.description 
            ? `updated the description` 
            : `removed the description`;
        }
        if (data.status) {
          return `changed status from "${String(data.previousStatus)}" to "${String(data.status)}"`;
        }
        if (data.dueDate !== undefined) {
          return data.dueDate 
            ? `set the due date to ${formatDate(typeof data.dueDate === 'string' ? data.dueDate : String(data.dueDate))}` 
            : `removed the due date`;
        }
        if (data.completed !== undefined) {
          return data.completed 
            ? `marked this card as complete` 
            : `marked this card as incomplete`;
        }
        if (data.assigneeId !== undefined) {
          return data.assigneeId 
            ? `assigned this card to ${data.assigneeName ? String(data.assigneeName) : "someone"}` 
            : `unassigned this card`;
        }
        return "updated this card";
      case "delete_card":
        return "deleted this card";
      case "add_comment":
        return "added a comment";
      case "delete_comment":
        return "deleted a comment";
      case "move_card":
        return `moved this card from "${String(data.fromList)}" to "${String(data.toList)}"`;
      default:
        return "performed an action on this card";
    }
  };

  if (!task) return null;
  
  // Use non-null assertion to tell TypeScript that task is not null beyond this point
  const safeTask = task!;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Task Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <Input 
                        value={editedTask?.title} 
                        onChange={(e) => updateTaskField("title", e.target.value)}
                        className="text-xl font-semibold"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-xl font-bold">{safeTask.title}</DialogTitle>
                        {/* Status Badge */}
                        <Badge 
                          className={cn(
                            "ml-2",
                            safeTask.status === "done" || safeTask.status === "review"
                              ? "bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300 border-green-500/50" 
                              : safeTask.status === "in-progress"
                                ? "bg-amber-500/20 text-amber-700 dark:bg-amber-500/30 dark:text-amber-300 border-amber-500/50"
                                : "bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300 border-blue-500/50"
                          )}
                        >
                          {safeTask.status === "todo" && "To Do"}
                          {safeTask.status === "in-progress" && "In Progress"}
                          {safeTask.status === "review" && "In Review"}
                          {safeTask.status === "done" && "Done"}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>in column</span>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${safeTask.status === 'todo' ? 'border-gray-200 bg-gray-100' : ''}
                          ${safeTask.status === 'in-progress' ? 'border-blue-200 bg-blue-100 text-blue-800' : ''}
                          ${safeTask.status === 'review' ? 'border-yellow-200 bg-yellow-100 text-yellow-800' : ''}
                          ${safeTask.status === 'done' ? 'border-green-200 bg-green-100 text-green-800' : ''}
                        `}
                      >
                        {COLUMNS.find(col => col.id === safeTask.status)?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-6 w-6 rounded-full"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={toggleEditMode}>
                      <Edit className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  {isEditing && (
                    <Button variant="default" size="sm" onClick={toggleEditMode}>
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Task Navigation */}
        <div className="border-b">
          <div className="flex px-6">
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === "details"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === "activity"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("activity")}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Task Content */}
        <div className="p-6">
          {activeTab === "details" ? (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                    <span className="mr-2">Description</span>
                    {!isEditing && (
                      <Button variant="ghost" size="sm" className="h-6 px-2" onClick={toggleEditMode}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </h3>
                  {isEditing ? (
                    <Textarea 
                      value={editedTask?.description} 
                      onChange={(e) => updateTaskField("description", e.target.value)}
                      className="min-h-[120px]"
                      placeholder="Add a more detailed description..."
                    />
                  ) : (
                    <div className="rounded-md bg-muted/40 p-3">
                      {safeTask.description ? (
                        <p className="text-sm whitespace-pre-line">{safeTask.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No description provided</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Attachments Section */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                    <span className="mr-2">Attachments</span>
                    <Badge variant="outline" className="ml-2 rounded-full px-2 py-0 text-xs">
                      {safeTask.attachmentsCount}
                    </Badge>
                  </h3>
                  
                  {safeTask.attachmentsCount > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-md border p-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">document-specs.pdf</p>
                          <p className="text-xs text-muted-foreground">Added Apr 12, 2023</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center">
                      <Paperclip className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No attachments yet</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Add attachment
                      </Button>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                    <span className="mr-2">Comments</span>
                    <Badge variant="outline" className="ml-2 rounded-full px-2 py-0 text-xs">
                      {comments.length}
                    </Badge>
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {safeTask.assignee?.initials || "U"}
                    </div>
                    <div className="flex-1">
                      <Textarea 
                        placeholder="Add a comment..." 
                        className="min-h-[80px]"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isSubmittingComment}
                      />
                      <div className="mt-2">
                        <Button 
                          size="sm" 
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isSubmittingComment}
                        >
                          {isSubmittingComment ? "Adding..." : "Add Comment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {isLoadingComments ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    <ScrollArea className="h-[300px] pr-4" ref={scrollAreaRef}>
                      <div className="space-y-4 pt-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {comment.user.imageUrl ? (
                                <Image 
                                  src={comment.user.imageUrl} 
                                  alt={comment.user.name} 
                                  width={32} 
                                  height={32}
                                  className="h-full w-full rounded-full object-cover" 
                                />
                              ) : (
                                comment.user.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{comment.user.name}</span>
                                  <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  disabled={isDeletingComment}
                                >
                                  <Trash className="h-3 w-3" />
                                  <span className="sr-only">Delete comment</span>
                                </Button>
                              </div>
                              <p className="mt-1 text-sm whitespace-pre-line">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {hasMoreComments && (
                          <div className="flex justify-center py-2" ref={commentsEndRef}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleLoadMoreComments}
                              disabled={isLoadingMoreComments}
                              className="text-xs"
                            >
                              {isLoadingMoreComments ? (
                                <>
                                  <div className="animate-spin h-3 w-3 mr-2 border border-current border-t-transparent rounded-full"></div>
                                  Loading more...
                                </>
                              ) : (
                                "Load more comments"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="rounded-md border border-dashed p-6 text-center">
                      <p className="text-sm text-muted-foreground">No comments yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Status */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  {isEditing ? (
                    <Select 
                      defaultValue={editedTask?.status}
                      onValueChange={(value) => updateTaskField("status", value as TaskStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLUMNS.map((column) => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className={`
                        ${safeTask.status === 'todo' ? 'border-gray-200 bg-gray-100' : ''}
                        ${safeTask.status === 'in-progress' ? 'border-blue-200 bg-blue-100 text-blue-800' : ''}
                        ${safeTask.status === 'review' ? 'border-yellow-200 bg-yellow-100 text-yellow-800' : ''}
                        ${safeTask.status === 'done' ? 'border-green-200 bg-green-100 text-green-800' : ''}
                      `}
                    >
                      {COLUMNS.find(col => col.id === safeTask.status)?.label}
                    </Badge>
                  )}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                  {isEditing ? (
                    <Select 
                      defaultValue={editedTask?.priority}
                      onValueChange={(value) => updateTaskField("priority", value as TaskPriority)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div 
                        className={`h-2 w-2 rounded-full ${PRIORITY_CONFIG[safeTask.priority].color}`} 
                      />
                      <span>{PRIORITY_CONFIG[safeTask.priority].label}</span>
                    </div>
                  )}
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Assignee</h3>
                  {isEditing ? (
                    <Select 
                      defaultValue={editedTask?.assignee?.id || "unassigned"}
                      onValueChange={(value) => {
                        // In a real app, you would fetch user details or use a predefined list
                        if (value === "unassigned") {
                          updateTaskField("assignee", null);
                        } else {
                          // Mock assignee for demo
                          updateTaskField("assignee", {
                            id: value,
                            name: value === "1" ? "John Doe" : value === "2" ? "Jane Smith" : "Robert Johnson",
                            avatar: value === "1" ? "/avatars/user.png" : null,
                            initials: value === "1" ? "JD" : value === "2" ? "JS" : "RJ",
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        <SelectItem value="1">John Doe</SelectItem>
                        <SelectItem value="2">Jane Smith</SelectItem>
                        <SelectItem value="3">Robert Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>
                      {safeTask.assignee ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium"
                          >
                            {safeTask.assignee.avatar ? (
                              <Image
                                src={safeTask.assignee.avatar}
                                alt={safeTask.assignee.name}
                                width={24}
                                height={24}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              safeTask.assignee.initials
                            )}
                          </div>
                          <span>{safeTask.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  {isEditing ? (
                    <Input 
                      type="date" 
                      value={editedTask?.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateTaskField("dueDate", value ? new Date(value).toISOString() : null);
                      }}
                    />
                  ) : (
                    <div>
                      {safeTask.dueDate ? (
                        <div 
                          className={`flex items-center gap-1 ${isOverdue(safeTask.dueDate) ? 'text-red-500' : ''}`}
                        >
                          {isOverdue(safeTask.dueDate) ? (
                            <AlertCircle className="h-4 w-4" />
                          ) : (
                            <Calendar className="h-4 w-4" />
                          )}
                          <span>
                            {formatDate(safeTask.dueDate)}
                            {isOverdue(safeTask.dueDate) && " (Overdue)"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No due date</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Created Date */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(safeTask.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full" size="sm">
                    <Trash className="mr-1 h-4 w-4" />
                    Delete Task
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Activity Log</h3>
              {isLoadingActivities ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : activities.length > 0 ? (
                <ScrollArea className="h-[400px] pr-4" ref={activitiesScrollAreaRef}>
                  <div className="space-y-4">
                    {activities.map((activity: ActivityWithUser) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {activity.user.imageUrl ? (
                            <Image 
                              src={activity.user.imageUrl} 
                              alt={activity.user.name} 
                              width={32} 
                              height={32}
                              className="h-full w-full rounded-full object-cover" 
                            />
                          ) : (
                            activity.user.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{activity.user.name}</span>
                            <span className="text-xs text-muted-foreground">{formatRelativeTime(activity.createdAt)}</span>
                          </div>
                          <p className="text-sm">{formatActivityMessage(activity)}</p>
                        </div>
                      </div>
                    ))}
                    
                    {hasMoreActivities && (
                      <div className="flex justify-center py-2" ref={activitiesEndRef}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleLoadMoreActivities}
                          disabled={isLoadingMoreActivities}
                          className="text-xs"
                        >
                          {isLoadingMoreActivities ? (
                            <>
                              <div className="animate-spin h-3 w-3 mr-2 border border-current border-t-transparent rounded-full"></div>
                              Loading more...
                            </>
                          ) : (
                            "Load more activities"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 