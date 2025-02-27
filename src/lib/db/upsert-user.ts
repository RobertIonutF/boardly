import { prisma } from "@/lib/prisma";

interface UpsertUserData {
  id: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
}

/**
 * Creates a new user or updates an existing one based on Clerk ID
 * @param userData User data from Clerk
 * @returns The created or updated user
 */
export async function upsertUser(userData: UpsertUserData) {
  try {
    const user = await prisma.user.upsert({
      where: {
        id: userData.id,
      },
      update: {
        email: userData.email,
        name: userData.name,
        imageUrl: userData.imageUrl,
        updatedAt: new Date(),
      },
      create: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        imageUrl: userData.imageUrl,
      },
    });
    
    return user;
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
} 