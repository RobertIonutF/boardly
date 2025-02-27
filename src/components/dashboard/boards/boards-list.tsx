"use client";

import { BoardCard } from "./board-card";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, Plus, Loader2, Star, Grid3X3, List, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useBoards, useCategories } from "@/hooks/queries/use-boards";
import { CreateBoardDialog } from "./create-board-dialog";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Progress status options
const PROGRESS_STATUS = [
  { value: "all", label: "All" },
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export function BoardsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [progressStatus, setProgressStatus] = useState<string>("all");
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const limit = 9;

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    boards,
    pagination,
    isLoading,
    error,
    createBoard,
  } = useBoards(currentPage, limit, debouncedSearchQuery, selectedCategory, showFavorites);

  // Fetch all distinct categories from the database
  const { 
    data: allCategories = [], 
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useCategories();

  // Ensure allCategories is always an array
  const safeAllCategories = Array.isArray(allCategories) ? allCategories : [];

  // Use all categories from the API if available, otherwise fall back to extracting from current boards
  const categories = safeAllCategories.length > 0 
    ? safeAllCategories 
    : Array.from(new Set(boards.map(board => board.category)))
        .sort((a, b) => a.localeCompare(b));

  // Handle search
  const handleSearch = () => {
    setDebouncedSearchQuery(searchQuery);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle category selection
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("");
    }
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Filter boards based on progress status only (category filtering is now done server-side)
  const filteredBoards = boards.filter(board => {
    // Progress status filter
    if (progressStatus !== "all") {
      const completionRate = board.tasksCount && board.completedTasksCount 
        ? (board.completedTasksCount / board.tasksCount) * 100 
        : 0;
      switch (progressStatus) {
        case "not-started":
          return completionRate === 0;
        case "in-progress":
          return completionRate > 0 && completionRate < 100;
        case "completed":
          return completionRate === 100;
        default:
          return true;
      }
    }

    return true;
  });

  // Show loading state if either boards or categories are loading
  const isPageLoading = isLoading || isCategoriesLoading;
  
  // Combine errors
  const pageError = error || categoriesError;

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (progressStatus !== "all") count++;
    if (showFavorites) count++;
    return count;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("");
    setProgressStatus("all");
    setShowFavorites(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header with title and create button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Boards</h1>
          <p className="text-muted-foreground">
            Create and manage your boards to organize your tasks and projects.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="gap-1.5 shadow-sm"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Create Board
        </Button>
      </div>

      {/* Search and filters */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Search bar */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search boards..."
                className="pl-9 pr-12 h-10 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1.5 h-7 w-7 text-muted-foreground"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearchQuery("");
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Tabs 
                value={viewMode} 
                onValueChange={(value) => setViewMode(value as "grid" | "list")}
                className="hidden md:block"
              >
                <TabsList className="h-9">
                  <TabsTrigger value="grid" className="px-3">
                    <LayoutGrid className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="px-3">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-9 gap-1.5", 
                  showFavorites && "bg-yellow-500 hover:bg-yellow-600 text-white"
                )}
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setCurrentPage(1); // Reset to first page when toggling favorites
                }}
              >
                <Star className={cn("h-4 w-4", showFavorites && "fill-white text-white")} />
                {showFavorites ? "Favorites" : "Favorites"}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5">
                    <Filter className="h-4 w-4" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 min-w-5 h-5">
                        {getActiveFiltersCount()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Boards</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <p className="mb-2 text-xs font-medium">Category</p>
                    {isPageLoading ? (
                      <div className="py-1.5 text-sm text-muted-foreground">
                        Loading categories...
                      </div>
                    ) : categories.length > 0 ? (
                      <div className="space-y-1">
                        <DropdownMenuCheckboxItem
                          key="all-categories"
                          checked={selectedCategory === ""}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedCategory("");
                          }}
                        >
                          All Categories
                        </DropdownMenuCheckboxItem>
                        {categories.map((category) => (
                          <DropdownMenuCheckboxItem
                            key={category}
                            checked={selectedCategory === category}
                            onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                          >
                            {category}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    ) : (
                      <div className="py-1.5 text-sm text-muted-foreground">
                        No categories found
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <p className="mb-2 text-xs font-medium">Progress</p>
                    <Select value={progressStatus} onValueChange={setProgressStatus}>
                      <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder="Progress" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROGRESS_STATUS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-8"
                      onClick={clearAllFilters}
                      disabled={getActiveFiltersCount() === 0}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Active filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {showFavorites && (
                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  Favorites
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 -mr-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowFavorites(false)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </Badge>
              )}
              
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  Category: {selectedCategory}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 -mr-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedCategory("")}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </Badge>
              )}
              
              {progressStatus !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  Progress: {PROGRESS_STATUS.find(s => s.value === progressStatus)?.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 -mr-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setProgressStatus("all")}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Boards grid */}
      {isPageLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading boards...</p>
          </div>
        </div>
      ) : pageError ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2 text-center max-w-md">
            <div className="rounded-full bg-destructive/10 p-3">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">Error Loading Boards</h3>
            <p className="text-sm text-muted-foreground">
              {pageError.message || "There was an error loading your boards. Please try again."}
            </p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : filteredBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Grid3X3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No boards found</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1 mb-4">
            {searchQuery 
              ? `No boards match your search for "${searchQuery}".` 
              : getActiveFiltersCount() > 0 
                ? "No boards match your current filters." 
                : "You haven't created any boards yet. Create your first board to get started."}
          </p>
          {searchQuery || getActiveFiltersCount() > 0 ? (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear Filters
            </Button>
          ) : (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Board
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
              : "space-y-3"
          )}>
            {filteredBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pagination.totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Create Board Dialog */}
      {isCreateDialogOpen && (
        <CreateBoardDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreateBoard={createBoard.mutateAsync}
          isPending={createBoard.isPending}
        />
      )}
    </div>
  );
} 