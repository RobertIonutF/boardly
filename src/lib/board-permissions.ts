import { db } from "@/lib/db";

/**
 * Permission levels for board operations
 */
export enum BoardPermission {
  VIEW = "VIEW",       // Can view the board
  EDIT = "EDIT",       // Can edit cards and lists
  MANAGE = "MANAGE",   // Can manage board settings, members, etc.
  OWNER = "OWNER",     // Full control (board owner)
}

/**
 * Check if a user has permission to perform an operation on a board
 */
export async function checkBoardPermission(
  boardId: string,
  userId: string,
  requiredPermission: BoardPermission
): Promise<boolean> {
  try {
    // First, check if user is the board owner (has all permissions)
    const board = await db.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return false;
    }

    // Board owner has all permissions
    if (board.userId === userId) {
      return true;
    }

    // For other users, check their membership role
    const member = await db.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    if (!member) {
      return false;
    }

    // Map member role to permission level
    switch (requiredPermission) {
      case BoardPermission.VIEW:
        // Both EDITOR and VIEWER roles can view
        return true;
      
      case BoardPermission.EDIT:
        // Only EDITOR role can edit
        return member.role === "EDITOR";
      
      case BoardPermission.MANAGE:
        // Only EDITOR role can manage
        return member.role === "EDITOR";
      
      case BoardPermission.OWNER:
        // Only the board owner has OWNER permission
        return false;
      
      default:
        return false;
    }
  } catch (error) {
    console.error("Error checking board permission:", error);
    return false;
  }
}

/**
 * Check if a user can view a board (including via share link)
 */
export async function canViewBoard(
  boardId: string,
  userId?: string,
  shareToken?: string
): Promise<boolean> {
  try {
    // If user is logged in, check their permissions
    if (userId) {
      const hasPermission = await checkBoardPermission(
        boardId,
        userId,
        BoardPermission.VIEW
      );
      
      if (hasPermission) {
        return true;
      }
    }

    // If share token is provided, check if it's valid
    if (shareToken) {
      const shareLink = await db.boardShare.findUnique({
        where: { token: shareToken },
      });

      if (
        shareLink &&
        shareLink.boardId === boardId &&
        new Date() <= shareLink.expiresAt
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking board view permission:", error);
    return false;
  }
}

/**
 * Check if a user can edit a board's cards and lists
 */
export async function canEditBoard(
  boardId: string,
  userId: string
): Promise<boolean> {
  return checkBoardPermission(boardId, userId, BoardPermission.EDIT);
}

/**
 * Check if a user can manage a board (settings, members, etc.)
 */
export async function canManageBoard(
  boardId: string,
  userId: string
): Promise<boolean> {
  return checkBoardPermission(boardId, userId, BoardPermission.MANAGE);
}

/**
 * Check if a user is the owner of a board
 */
export async function isOwnerOfBoard(
  boardId: string,
  userId: string
): Promise<boolean> {
  return checkBoardPermission(boardId, userId, BoardPermission.OWNER);
} 