import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up and disconnect
  await prisma.post.deleteMany();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.post.deleteMany();
});

export { prisma };
