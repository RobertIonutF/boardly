import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const user = await currentUser();

  if (!user || !user.id) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!dbUser) {
    console.warn(`User with Clerk ID ${user.id} not found in the database`);
    return null;
  }

  return dbUser;
} 