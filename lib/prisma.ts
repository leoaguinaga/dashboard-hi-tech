import { PrismaClient } from "../prisma/generated/client"
import { PrismaPg }    from "@prisma/adapter-pg"

/**
 * Prisma v7 requiere un adapter explícito — la URL no va al constructor.
 * PrismaPg usa el driver `pg` nativo con la connection string de Neon.
 */
function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
