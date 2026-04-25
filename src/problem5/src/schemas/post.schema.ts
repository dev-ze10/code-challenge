import { z } from 'zod';

export const StatusEnum = z.enum(['DRAFT', 'PUBLISHED']);

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  content: z.string().optional().default(''),
  author: z.string().min(1, 'Author is required').max(200, 'Author name is too long'),
  status: StatusEnum.optional().default('DRAFT'),
  tags: z.array(z.string()).optional().default([]),
});

export const UpdatePostSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string(),
  author: z.string().min(1).max(200),
  status: StatusEnum,
  tags: z.array(z.string()),
}).partial();

export const QueryPostSchema = z.object({
  status: StatusEnum.optional(),
  author: z.string().optional(),
  tags: z.string().transform((s) => s.split(',').map((t) => t.trim())).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const IdParamSchema = z.object({
  id: z.uuid({ message: 'Invalid UUID format' }),
});
