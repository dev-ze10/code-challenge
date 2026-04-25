-- EnableExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "posts_tags_idx" ON "posts" USING GIN ("tags");

-- CreateIndex
CREATE INDEX "posts_createdAt_idx" ON "posts"("createdAt");

-- CreateIndex
CREATE INDEX "posts_status_createdAt_idx" ON "posts"("status", "createdAt");

-- CreateIndex
CREATE INDEX "posts_title_trgm_idx" ON "posts" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "posts_author_trgm_idx" ON "posts" USING GIN ("author" gin_trgm_ops);
