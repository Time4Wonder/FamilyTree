import { PrismaClient } from '@prisma/client';
import { getDataPath } from './config';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  
  const dataPath = getDataPath();
  // Safe fallback if not configured
  if (!dataPath) return new PrismaClient();

  const dbPath = path.join(dataPath, 'database', 'dev.db');
  const client = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;
  
  return client;
};

export const resetPrisma = () => {
  globalForPrisma.prisma = undefined;
};

export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return (getPrisma() as any)[prop];
  }
});
