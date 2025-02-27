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
      });
    }
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    return NextResponse.json({
      authenticated: true,
      userId,
      userInDatabase: !!user,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
      } : null,
    });
  } catch (error) {
    console.error("Error in debug auth endpoint:", error);
    
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null,
    }, { status: 500 });
  }
} 