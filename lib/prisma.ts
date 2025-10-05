import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "./generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient & ReturnType<typeof withAccelerate>;
};

// .$extends(withAccelerate())

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
