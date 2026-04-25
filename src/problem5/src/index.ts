import dotenv from 'dotenv';
import { createApp } from './app.js';
import prisma from './utils/prisma.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createApp();

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}/api/posts`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

export { app };
