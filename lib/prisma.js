import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    errorFormat: process.env.NODE_ENV === "production" ? "minimal" : "pretty",
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
