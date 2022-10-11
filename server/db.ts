import { PrismaClient } from '@prisma/client'

declare global {
  const prisma: PrismaClient | undefined
}

// link to explanation of this silution
// https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
export const prisma = new PrismaClient
