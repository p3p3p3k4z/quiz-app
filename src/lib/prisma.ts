// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined; // eslint-disable-line no-var
}

const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Esto es útil para ver qué consultas hace Prisma
});

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;