import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from './setup';

const app = createApp();

describe('POST /api/posts', () => {
  it('should create a post with valid data', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        title: 'My First Post',
        content: '# Hello World\n\nThis is **markdown** content.',
        author: 'John Doe',
        status: 'DRAFT',
        tags: ['tech', 'nodejs'],
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe('My First Post');
    expect(response.body.data.author).toBe('John Doe');
    expect(response.body.data.status).toBe('DRAFT');
    expect(response.body.data.tags).toEqual(['tech', 'nodejs']);
  });

  it('should create a post with default status DRAFT', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        title: 'Test Post',
        content: 'Content here',
        author: 'Jane Doe',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('DRAFT');
    expect(response.body.data.tags).toEqual([]);
  });

  it('should return 400 when title is missing', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        content: 'Content here',
        author: 'John Doe',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should create a post with empty content by default', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        title: 'Test Post',
        author: 'John Doe',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.content).toBe('');
  });

  it('should return 400 when status is invalid', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        title: 'Test Post',
        content: 'Content here',
        author: 'John Doe',
        status: 'INVALID_STATUS',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/posts', () => {
  beforeEach(async () => {
    // Create test posts
    await prisma.post.createMany({
      data: [
        {
          title: 'Draft Post 1',
          content: 'Content 1',
          author: 'Alice',
          status: 'DRAFT',
          tags: ['tech', 'nodejs'],
        },
        {
          title: 'Published Post 1',
          content: 'Content 2',
          author: 'Bob',
          status: 'PUBLISHED',
          tags: ['tech', 'javascript'],
        },
        {
          title: 'Published Post 2',
          content: 'Content 3 about React',
          author: 'Alice',
          status: 'PUBLISHED',
          tags: ['frontend'],
        },
      ],
    });
  });

  it('should list all posts', async () => {
    const response = await request(app).get('/api/posts');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.meta.total).toBe(3);
    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.limit).toBe(10);
  });

  it('should filter posts by status', async () => {
    const response = await request(app).get('/api/posts?status=PUBLISHED');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((p: any) => p.status === 'PUBLISHED')).toBe(true);
  });

  it('should filter posts by author', async () => {
    const response = await request(app).get('/api/posts?author=Alice');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.every((p: any) => p.author === 'Alice')).toBe(true);
  });

  it('should filter posts by tags', async () => {
    const response = await request(app).get('/api/posts?tags=tech');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
  });

  it('should search posts by title keyword', async () => {
    const response = await request(app).get('/api/posts?search=Draft');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toContain('Draft');
  });

  it('should paginate results', async () => {
    const response = await request(app).get('/api/posts?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.limit).toBe(2);
    expect(response.body.meta.totalPages).toBe(2);
  });
});

describe('GET /api/posts/:id', () => {
  let postId: string;

  beforeEach(async () => {
    const post = await prisma.post.create({
      data: {
        title: 'Test Post',
        content: 'Test Content',
        author: 'Test Author',
      },
    });
    postId = post.id;
  });

  it('should get a post by ID', async () => {
    const response = await request(app).get(`/api/posts/${postId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(postId);
    expect(response.body.data.title).toBe('Test Post');
  });

  it('should return 404 for non-existent post', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app).get(`/api/posts/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid UUID', async () => {
    const response = await request(app).get('/api/posts/invalid-uuid');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/posts/:id', () => {
  let postId: string;

  beforeEach(async () => {
    const post = await prisma.post.create({
      data: {
        title: 'Original Title',
        content: 'Original Content',
        author: 'Original Author',
        status: 'DRAFT',
      },
    });
    postId = post.id;
  });

  it('should update a post', async () => {
    const response = await request(app)
      .put(`/api/posts/${postId}`)
      .send({
        title: 'Updated Title',
        status: 'PUBLISHED',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Updated Title');
    expect(response.body.data.status).toBe('PUBLISHED');
    expect(response.body.data.content).toBe('Original Content'); // Unchanged
  });

  it('should return 404 for non-existent post', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app)
      .put(`/api/posts/${fakeId}`)
      .send({ title: 'Updated' });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid data', async () => {
    const response = await request(app)
      .put(`/api/posts/${postId}`)
      .send({ title: '' }); // Empty title

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /api/posts/:id', () => {
  let postId: string;

  beforeEach(async () => {
    const post = await prisma.post.create({
      data: {
        title: 'To Be Deleted',
        content: 'Content',
        author: 'Author',
      },
    });
    postId = post.id;
  });

  it('should delete a post', async () => {
    const response = await request(app).delete(`/api/posts/${postId}`);

    expect(response.status).toBe(204);

    // Verify it's deleted
    const checkResponse = await request(app).get(`/api/posts/${postId}`);
    expect(checkResponse.status).toBe(404);
  });

  it('should return 404 for non-existent post', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    const response = await request(app).delete(`/api/posts/${fakeId}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /health', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});
