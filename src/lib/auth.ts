import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Gets the current authenticated user from Clerk and checks if they exist in the database
 * @returns The user's ID and database record
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error("No authenticated user found");
      redirect("/sign-in");
    }

    console.log(`Authenticated user: ${userId}`);

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // If the user doesn't exist in the database, they need to be created
    // This could happen if they authenticated with Clerk but the webhook hasn't processed yet
    if (!user) {
      console.warn(`User ${userId} authenticated with Clerk but not found in database`);
      // You could redirect to an onboarding page here if needed
      // For now, we'll just return the Clerk ID
    } else {
      console.log(`Found user in database: ${user.id}`);
    }

    return {
      id: userId,
      dbUser: user,
    };
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    // In API routes, we should throw the error to be handled by the caller
    // In server components, we should redirect to sign-in
    if (typeof window === 'undefined') {
      throw error;
    } else {
      redirect("/sign-in");
    }
  }
} 