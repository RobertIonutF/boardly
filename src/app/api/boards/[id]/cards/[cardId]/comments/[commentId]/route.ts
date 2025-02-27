import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// DELETE - Delete a comment
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; cardId: string; commentId: string } }
) {
  try {
    // Get the current user
    const { id: userId } = await getCurrentUser();
    
    // Check if the board exists and belongs to the user
    const board = await prisma.board.findFirst({
      where: {
        id: params.id,
        userId,
      },
    });
    
    if (!board) {
      return NextResponse.json(
        { error: "Board not found or you don't have permission to modify it" },
        { status: 404 }
      );
    }
    
    // Check if the card exists and belongs to a list in this board
    const card = await prisma.card.findFirst({
      where: {
        id: params.cardId,
        list: {
          boardId: params.id,
        },
      },
    });
    
    if (!card) {
      return NextResponse.json(
        { error: "Card not found or does not belong to this board" },
        { status: 404 }
      );
    }
    
    // Get the comment to be deleted (for activity record)
    const comment = await prisma.comment.findUnique({
      where: {
        id: params.commentId,
      },
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }
    
    // Check if the user is the owner of the comment or the board
    if (comment.userId !== userId && board.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this comment" },
        { status: 403 }
      );
    }
    
    // Delete the comment
    await prisma.comment.delete({
      where: {
        id: params.commentId,
      },
    });
    
    // Create an activity record for the comment deletion
    await prisma.activity.create({
      data: {
        type: "delete_comment",
        entityType: "comment",
        entityId: params.commentId,
        userId,
        boardId: params.id,
        cardId: params.cardId,
        data: JSON.parse(JSON.stringify({ 
          content: comment.content.substring(0, 50) + (comment.content.length > 50 ? "..." : ""),
        })),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
} 