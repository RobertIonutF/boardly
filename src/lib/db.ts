// Export the Prisma client for use throughout the application
import { prisma } from "./prisma";

export const db = prisma;

// Re-export types from Prisma for convenience
export * from "@prisma/client"; 