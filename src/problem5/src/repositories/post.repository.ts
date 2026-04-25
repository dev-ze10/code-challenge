import { Post, Status, Prisma } from '@prisma/client';
import prisma from '../utils/prisma.js';

interface FindManyParams {
  status?: string;
  author?: string;
  tags?: string[];
  search?: string;
  page: number;
  limit: number;
}

class PostRepository {
  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return prisma.post.create({ data });
  }

  async findMany(filters: FindManyParams) {
    const { page, limit, status, author, tags, search } = filters;
    const where: Prisma.PostWhereInput = {};

    if (status) where.status = status as Status;
    if (author) where.author = { contains: author, mode: 'insensitive' };
    if (tags?.length) where.tags = { hasSome: tags };
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<Post> {
    return prisma.post.findUniqueOrThrow({ where: { id } });
  }

  async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    return prisma.post.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Post> {
    return prisma.post.delete({ where: { id } });
  }
}

export default new PostRepository();
