"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  MoreHorizontal, 
  Calendar, 
  CheckCircle2, 
  MessageSquare,
  Pencil,
  Trash2,
  AlertCircle,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TaskDialog } from "./task-dialog";
import { AddTaskDialog } from "./add-task-dialog";
import { AddListDialog } from "./add-list-dialog";
import { EditListDialog } from "./edit-list-dialog";
import { useBoardLists } from "@/hooks/queries/use-board-lists";
import { useBoardCards } from "@/hooks/queries/use-board-cards";
import { CardWithRelations } from "@/lib/db/get-lists";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BoardData } from "./board-header";
import { List } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Image from "next/image";

// Task status and priority types
type TaskStatus = "todo" | "in-progress" | "review" | "done";
type TaskPriority = "low" | "medium" | "high";

// Task interface for TaskDialog
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

interface BoardContentProps {
  boardData: BoardData;
  isReadOnly?: boolean;
}

// Type for list with cards
interface ListWithCards extends List {
  cards?: CardWithRelations[];
}

// Helper function to convert a card to a task
const cardToTask = (card: CardWithRelations): Task => ({
  id: card.id,
  title: card.title,
  description: card.description || "",
  // Default values for fields that don't exist in CardWithRelations
  status: "todo" as TaskStatus,
  priority: "medium" as TaskPriority,
  dueDate: card.dueDate 
    ? (card.dueDate instanceof Date ? card.dueDate.toISOString() : String(card.dueDate))
    : null,
  assignee: card.assignee ? {
    id: card.assignee.id,
    name: card.assignee.name || "Unknown",
    avatar: card.assignee.imageUrl,
    initials: (card.assignee.name?.[0] || "U").toUpperCase(),
  } : null,
  commentsCount: card.comments?.length || 0,
  attachmentsCount: 0, // TODO: Add attachments support
  createdAt: card.createdAt instanceof Date ? card.createdAt.toISOString() : String(card.createdAt),
});

// Type assertion function to handle imported types
function assertType<T>(value: unknown): T {
  return value as T;
}

// Custom dialog components for delete operations
interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}

// Delete List Dialog Component
function DeleteListDialog({ isOpen, onClose, onDelete, isLoading }: DeleteDialogProps) {
  return (
    <div className={`fixed inset-0 z-50 bg-black/50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center`}>
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-semibold">Delete List</h2>
        <p className="text-muted-foreground">
          Are you sure you want to delete this list? All cards in this list will also be deleted.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDelete} 
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete List"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Delete Card Dialog Component
function DeleteCardDialog({ isOpen, onClose, onDelete, isLoading }: DeleteDialogProps) {
  return (
    <div className={`fixed inset-0 z-50 bg-black/50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center`}>
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-semibold">Delete Card</h2>
        <p className="text-muted-foreground">
          Are you sure you want to delete this card? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDelete} 
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Card"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BoardContent({ boardData, isReadOnly = false }: BoardContentProps) {
  const boardId = boardData.id;
  const [activeTab, setActiveTab] = useState<string>("board");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [selectedListForTask, setSelectedListForTask] = useState<string | null>(null);
  const [isAddListDialogOpen, setIsAddListDialogOpen] = useState(false);
  const [isEditListDialogOpen, setIsEditListDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ListWithCards | null>(null);
  const [isDeleteListDialogOpen, setIsDeleteListDialogOpen] = useState(false);
  const [isDeleteCardDialogOpen, setIsDeleteCardDialogOpen] = useState(false);
  const [selectedCardForDelete, setSelectedCardForDelete] = useState<Task | null>(null);
  const listsContainerRef = useRef<HTMLDivElement>(null);

  // Use the lists from boardData if provided (for shared view), otherwise fetch them
  const {
    lists: fetchedLists = [],
    isLoading: isListsLoading,
    error: listsError,
    deleteList,
    createList,
  } = useBoardLists(boardId);

  // Use the lists from boardData if provided (for shared view), otherwise use fetched lists
  const lists = boardData.lists || fetchedLists;

  // Cards are fetched separately to handle updates
  const {
    updateCard,
    deleteCard,
    createCard,
  } = useBoardCards(boardId);

  const isLoading = isListsLoading || deleteList.isPending || deleteCard.isPending;

  // Handle list deletion
  const handleDeleteList = useCallback(async () => {
    if (!selectedList) return;
    await deleteList.mutateAsync(selectedList.id);
    setIsDeleteListDialogOpen(false);
  }, [selectedList, deleteList]);

  // Handle card deletion
  const handleDeleteCard = useCallback(async () => {
    if (!selectedCardForDelete) return;
    await deleteCard.mutateAsync(selectedCardForDelete.id);
    setIsDeleteCardDialogOpen(false);
    setSelectedCardForDelete(null);
  }, [selectedCardForDelete, deleteCard]);

  // Toggle card completion
  const handleToggleCardCompletion = useCallback(async (card: unknown, e: React.MouseEvent) => {
    e.stopPropagation();
    const typedCard = card as CardWithRelations;
    await updateCard.mutateAsync({
      cardId: typedCard.id,
      data: {
        completed: !typedCard.completed
      }
    });
  }, [updateCard]);

  // Format date for display
  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return null;
    
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return format(date, "MMM d");
  };

  // Check if a task is overdue
  const isOverdue = (dueDate: Date | string | null) => {
    if (!dueDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = dueDate instanceof Date ? dueDate : new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    
    return taskDueDate < today;
  };

  // Open task dialog
  const openTaskDialog = (card: unknown) => {
    setSelectedTask(assertType<Task>(card));
    setIsTaskDialogOpen(true);
  };

  // Close task dialog
  const closeTaskDialog = () => {
    setIsTaskDialogOpen(false);
  };

  // Scroll to the end of the lists container when adding a new list
  const scrollToEnd = () => {
    if (listsContainerRef.current) {
      listsContainerRef.current.scrollLeft = listsContainerRef.current.scrollWidth;
    }
  };

  // Handle adding a new list
  const handleAddList = async (data: { title: string }) => {
    // Type assertion to match the expected parameters of createList.mutateAsync
    type CreateListParams = Parameters<typeof createList.mutateAsync>[0];
    
    await createList.mutateAsync({
      title: data.title,
      boardId,
    } as CreateListParams);
    
    setIsAddListDialogOpen(false);
    // Scroll to the end after a short delay to ensure the new list is rendered
    setTimeout(scrollToEnd, 100);
  };

  // Handle adding a new card
  const handleAddCard = async (data: { title: string; description?: string }) => {
    if (!selectedListForTask) return;
    
    await createCard.mutateAsync({
      listId: selectedListForTask,
      title: data.title,
      description: data.description || "",
    });
    setIsAddTaskDialogOpen(false);
  };

  // Get the board color
  const boardColor = boardData.color || "#3b82f6";

  return (
    <div className="space-y-4">
      {/* Tabs for Board and Activity */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <TabsList className="h-10 bg-transparent p-0">
              <TabsTrigger 
                value="board" 
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium",
                  activeTab === "board" && "border-primary text-primary"
                )}
              >
                Board
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className={cn(
                  "rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-medium",
                  activeTab === "activity" && "border-primary text-primary"
                )}
              >
                Activity
              </TabsTrigger>
            </TabsList>
            
            {activeTab === "board" && !isReadOnly && (
              <Button 
                onClick={() => setIsAddListDialogOpen(true)}
                size="sm"
                className="gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                Add List
              </Button>
            )}
          </div>
          
          <TabsContent value="board" className="mt-4 pt-2">
            {isLoading ? (
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-[280px]">
                    <div className="bg-card rounded-lg border shadow-sm p-3 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-24 w-full rounded-md" />
                        <Skeleton className="h-24 w-full rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listsError ? (
              <div className="flex items-center justify-center h-64 border rounded-lg">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                  <h3 className="font-medium">Failed to load lists</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {listsError.message || "There was an error loading the board lists. Please try again."}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : lists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/30">
                <div className="text-center space-y-2 max-w-md px-4">
                  <h3 className="font-medium text-lg">No Lists Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    This board doesn&apos;t have any lists yet. Create your first list to start organizing your tasks.
                  </p>
                  {!isReadOnly && (
                    <Button 
                      onClick={() => setIsAddListDialogOpen(true)}
                      className="mt-2"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First List
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div 
                className="flex space-x-4 overflow-x-auto pb-6 pt-2 px-1 -mx-1 snap-x"
                ref={listsContainerRef}
              >
                {lists.map((list) => (
                  <div 
                    key={list.id} 
                    className="flex-shrink-0 w-[280px] snap-start"
                  >
                    <div 
                      className="bg-card rounded-lg border shadow-sm h-full flex flex-col"
                      style={{ borderTop: `3px solid ${boardColor}` }}
                    >
                      {/* List Header */}
                      <div className="p-3 border-b flex items-center justify-between">
                        <h3 className="font-medium truncate">{list.title}</h3>
                        {!isReadOnly && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedList(list as ListWithCards);
                                setIsEditListDialogOpen(true);
                              }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit List
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedList(list as ListWithCards);
                                  setIsDeleteListDialogOpen(true);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete List
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {/* Cards */}
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-3">
                          {(list as ListWithCards).cards && (list as ListWithCards).cards!.length > 0 ? (
                            (list as ListWithCards).cards!.map((card) => (
                              <div 
                                key={card.id}
                                onClick={() => openTaskDialog(cardToTask(card))}
                                className={cn(
                                  "bg-background rounded-lg border p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group",
                                  card.completed && "bg-muted/50 border-muted"
                                )}
                              >
                                {/* Card Title */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className={cn(
                                    "text-sm font-medium line-clamp-2",
                                    card.completed && "text-muted-foreground line-through"
                                  )}>
                                    {card.title}
                                  </h4>
                                  {!isReadOnly && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-6 w-6 shrink-0 rounded-full",
                                        card.completed ? "text-green-500" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                                      )}
                                      onClick={(e) => handleToggleCardCompletion(card, e)}
                                    >
                                      <CheckCircle2 className={cn(
                                        "h-4 w-4",
                                        card.completed && "fill-green-500"
                                      )} />
                                      <span className="sr-only">
                                        {card.completed ? "Mark as incomplete" : "Mark as complete"}
                                      </span>
                                    </Button>
                                  )}
                                </div>
                                
                                {/* Card Description (if exists) */}
                                {card.description && (
                                  <p className={cn(
                                    "text-xs text-muted-foreground line-clamp-2 mb-3",
                                    card.completed && "line-through"
                                  )}>
                                    {card.description}
                                  </p>
                                )}
                                
                                {/* Card Footer with metadata */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                  <div className="flex items-center gap-3">
                                    {/* Due Date */}
                                    {card.dueDate && (
                                      <div className={cn(
                                        "flex items-center gap-1",
                                        isOverdue(card.dueDate) && !card.completed && "text-destructive"
                                      )}>
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{formatDate(card.dueDate)}</span>
                                      </div>
                                    )}
                                    
                                    {/* Comments Count */}
                                    {card.comments && card.comments.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span>{card.comments.length}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Assignee */}
                                  {card.assignee && (
                                    <div className="flex items-center gap-1">
                                      {card.assignee.imageUrl ? (
                                        <Image 
                                          src={card.assignee.imageUrl} 
                                          alt={card.assignee.name || "User"} 
                                          width={20}
                                          height={20}
                                          className="rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                          {card.assignee.name?.[0] || "U"}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No cards in this list
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                      
                      {/* Add Card Button */}
                      {!isReadOnly && (
                        <div className="p-3 pt-0">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground hover:text-foreground h-auto py-2"
                            onClick={() => {
                              setSelectedListForTask(list.id);
                              setIsAddTaskDialogOpen(true);
                            }}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add a card
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Add List Button (shown at the end of the lists) */}
                {!isReadOnly && (
                  <div className="flex-shrink-0 w-[280px] snap-start">
                    <Button
                      variant="outline"
                      className="h-[120px] w-full border-dashed"
                      onClick={() => setIsAddListDialogOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Add another list
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activity" className="mt-4 pt-2">
            <div className="space-y-4">
              {boardData.activities && boardData.activities.length > 0 ? (
                <div className="space-y-4">
                  {boardData.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 items-start border-b pb-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">User</span> {activity.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/30">
                  <div className="text-center space-y-2 max-w-md px-4">
                    <h3 className="font-medium text-lg">No Activity Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      This board doesn&apos;t have any activity yet. Actions like creating lists and cards will appear here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Task Dialog */}
      {isTaskDialogOpen && selectedTask && (
        <TaskDialog
          task={selectedTask}
          isOpen={isTaskDialogOpen}
          onClose={closeTaskDialog}
          boardId={boardId}
          {...(isReadOnly ? { isReadOnly } : {})}
        />
      )}

      {/* Add Task Dialog */}
      {isAddTaskDialogOpen && (
        <AddTaskDialog
          isOpen={isAddTaskDialogOpen}
          onClose={() => setIsAddTaskDialogOpen(false)}
          boardId={boardId}
          listId={selectedListForTask || ""}
          onSuccess={() => {}}
          {...{ onAddTask: handleAddCard }}
          {...{ isPending: createCard?.isPending } as { isPending: boolean }}
        />
      )}

      {/* Add List Dialog */}
      {isAddListDialogOpen && (
        <AddListDialog
          isOpen={isAddListDialogOpen}
          onClose={() => setIsAddListDialogOpen(false)}
          boardId={boardId}
          onSuccess={() => {}}
          {...{ onAddList: handleAddList }}
          {...{ isPending: createList?.isPending } as { isPending: boolean }}
        />
      )}

      {/* Edit List Dialog */}
      {isEditListDialogOpen && selectedList && (
        <EditListDialog
          boardId={boardId}
          list={selectedList}
          isOpen={isEditListDialogOpen}
          onClose={() => setIsEditListDialogOpen(false)}
          onSuccess={() => setIsEditListDialogOpen(false)}
        />
      )}

      {/* Delete List Dialog */}
      <DeleteListDialog
        isOpen={isDeleteListDialogOpen}
        onClose={() => setIsDeleteListDialogOpen(false)}
        onDelete={handleDeleteList}
        isLoading={deleteList.isPending}
      />

      {/* Delete Card Dialog */}
      <DeleteCardDialog
        isOpen={isDeleteCardDialogOpen}
        onClose={() => setIsDeleteCardDialogOpen(false)}
        onDelete={handleDeleteCard}
        isLoading={deleteCard.isPending}
      />
    </div>
  );
} 