import { prisma } from "@/lib/prisma";

/**
 * Retrieves a user by their Clerk ID
 * @param userId The Clerk user ID
 * @returns The user object or null if not found
 */
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Retrieves a user by their email address
 * @param email The user's email address
 * @returns The user object or null if not found
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
} 