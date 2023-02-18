import { PrismaClient } from '@prisma/client';
import useAccelerate from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(useAccelerate)

export default prisma