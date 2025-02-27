# Migration from API Routes to Server Actions

This document outlines the migration from API routes to server actions for mutation operations in the Boardly application.

## Overview

We've migrated all mutation operations (create, update, delete) from API routes to server actions, while keeping GET operations as API routes. This approach allows us to:

1. Use `revalidatePath` for efficient cache invalidation after mutations
2. Continue using React Query for data fetching and client-side state management
3. Improve performance by reducing client-server roundtrips
4. Simplify error handling and type safety

## Server Actions Structure

Server actions are organized in the following directory structure:

```
src/actions/
├── boards/
│   ├── index.ts       # Board-related actions (create, update, delete, duplicate)
│   ├── lists.ts       # List-related actions (create, update, delete, reorder)
│   └── cards.ts       # Card-related actions (create, update, delete, toggle, move, reorder)
```

## API Routes Structure

We've kept the following API routes for GET operations:

```
src/app/api/
├── boards/
│   ├── route.ts       # GET /api/boards - Get all boards with pagination
│   └── [id]/
│       ├── route.ts   # GET /api/boards/[id] - Get a specific board
│       ├── lists/     # GET /api/boards/[id]/lists - Get lists for a board
│       └── cards/     # GET /api/boards/[id]/cards - Get cards for a board
```

## React Query Hooks

The React Query hooks have been updated to use server actions for mutations while keeping API routes for queries:

1. `useBoards` - Manages board operations (create, update, delete, duplicate)
2. `useBoardLists` - Manages list operations (create, update, delete, reorder)
3. `useBoardCards` - Manages card operations (create, update, delete, toggle, move, reorder)

## Error Handling

Server actions return a consistent response format:

```typescript
// Success response
{ success: true, data?: any }

// Error response
{ success: false, error: string, details?: any }
```

This allows for consistent error handling in the React Query hooks.

## Type Safety

All server actions use Zod schemas for input validation, ensuring type safety and consistent error messages.

## Migration Steps

1. Created server actions for all mutation operations
2. Updated React Query hooks to use server actions for mutations
3. Kept API routes for GET operations
4. Added `revalidatePath` calls in server actions to invalidate cached data

## Future Improvements

1. Consider migrating GET operations to server actions if needed
2. Add more comprehensive error handling and logging
3. Implement optimistic updates for better user experience
4. Add unit tests for server actions 