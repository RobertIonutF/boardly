import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get authentication status from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        message: "No authenticated user found",
      }, { status: 401 });
    }
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    if (!user) {
      return NextResponse.json({
        authenticated: true,
        userInDatabase: false,
        message: "User authenticated but not found in database",
      });
    }
    
    // Get boards count
    const boardsCount = await prisma.board.count({
      where: {
        userId,
      },
    });
    
    // Get first 5 boards
    const boards = await prisma.board.findMany({
      where: {
        userId,
      },
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
    });
    
    return NextResponse.json({
      authenticated: true,
      userId,
      userInDatabase: true,
      boardsCount,
      sampleBoards: boards.map(board => ({
        id: board.id,
        title: board.title,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error in debug boards endpoint:", error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null,
    }, { status: 500 });
  }
} 