import { Request, Response } from 'express';
import postRepository from '../repositories/post.repository.js';
import { CreatePostSchema, UpdatePostSchema, QueryPostSchema, IdParamSchema } from '../schemas/post.schema.js';

// Express 5 catches async errors automatically.
// Zod throws → errorHandler returns 400.
// Prisma throws P2025 → errorHandler returns 404.

const postController = {
  async create(req: Request, res: Response) {
    const data = CreatePostSchema.parse(req.body);
    const post = await postRepository.create(data);
    res.status(201).json({ data: post });
  },

  async list(req: Request, res: Response) {
    const query = QueryPostSchema.parse(req.query);
    const result = await postRepository.findMany(query);
    res.json(result);
  },

  async getById(req: Request, res: Response) {
    const { id } = IdParamSchema.parse(req.params);
    const post = await postRepository.findById(id);
    res.json({ data: post });
  },

  async update(req: Request, res: Response) {
    const { id } = IdParamSchema.parse(req.params);
    const data = UpdatePostSchema.parse(req.body);
    const post = await postRepository.update(id, data);
    res.json({ data: post });
  },

  async remove(req: Request, res: Response) {
    const { id } = IdParamSchema.parse(req.params);
    await postRepository.delete(id);
    res.status(204).send();
  },
};

export default postController;
