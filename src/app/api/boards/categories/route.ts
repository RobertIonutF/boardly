import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = currentUser.id;
    
    // Get all distinct categories for the user's boards
    const categories = await prisma.board.findMany({
      where: {
        userId,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    
    // Extract and capitalize the first letter of each category
    const formattedCategories = categories
      .map(item => item.category)
      .filter(Boolean)
      .map(category => {
        if (!category || category.length === 0) return "Other";
        return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      })
      .sort((a, b) => a.localeCompare(b));
    
    return NextResponse.json({ categories: formattedCategories || [] });
  } catch (error) {
    console.error("Error fetching board categories:", error);
    return NextResponse.json(
      { categories: [] },
      { status: 500 }
    );
  }
} 