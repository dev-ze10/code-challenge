# Post Management API

RESTful API for managing markdown posts with CRUD operations, filtering, and pagination.

**Stack:** Express.js + TypeScript + PostgreSQL + Prisma + Docker

## Prerequisites

- Docker & docker-compose (recommended) OR Node.js v24+ & PostgreSQL 18+

## Quick Start

**With Docker:**
```bash
cd src/problem5
docker-compose up -d
docker-compose exec app npx prisma migrate dev --name init
```

**Without Docker:**
```bash
npm install
cp .env.example .env  # Edit DATABASE_URL if needed
npm run prisma:migrate
npm run dev
```

API runs at http://localhost:3000

## API Endpoints

Base URL: `http://localhost:3000/api/posts`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/posts` | Create post |
| GET | `/api/posts` | List posts with filters |
| GET | `/api/posts/:id` | Get post by ID |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |

**Query Parameters (GET /api/posts):**
- `status`: DRAFT or PUBLISHED
- `author`: Filter by author
- `tags`: Comma-separated (e.g., `tech,nodejs`)
- `search`: Search title/content
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Example:**
```bash
# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"# Hello","author":"John","status":"DRAFT","tags":["tech"]}'

# List published posts
curl "http://localhost:3000/api/posts?status=PUBLISHED&page=1&limit=10"

# Get by ID
curl http://localhost:3000/api/posts/123e4567-e89b-12d3-a456-426614174000
```

## Common Commands

```bash
npm test                    # Run tests
npm run dev                 # Start dev server
npm run build               # Build for production
npm run prisma:studio       # Open database GUI (localhost:5555)
npm run benchmark           # Performance test
docker-compose up -d        # Start with Docker
docker-compose logs -f app  # View logs
```

## Benchmark Results

Performance test (10s per endpoint, 10 concurrent connections, PostgreSQL local, Apple M-series):

| Endpoint | Ops/s | Avg Latency | P99 Latency |
|----------|------:|------------:|------------:|
| `POST /api/posts` | 6,667 | 1.49ms | 5.04ms |
| `GET /api/posts` | 2,598 | 3.83ms | 7.14ms |
| `GET /api/posts?filter` | 213 | 46.18ms | 79.31ms |
| `GET /api/posts/:id` | 17,145 | 0.58ms | 1.52ms |
| `PUT /api/posts/:id` | 2,018 | 4.94ms | 19.22ms |
| `DELETE /api/posts/:id` | 3,720 | 1.32ms | 2.67ms |

*Note: LIST endpoints slow down during benchmarks because CREATE runs first and inserts ~67k rows. Text search uses GIN trigram indexes (`pg_trgm`) for fast `ILIKE` queries on `title` and `author`.*

## Troubleshooting

**Port in use:** `lsof -i :3000 && kill -9 <PID>`  
**DB error:** Check `DATABASE_URL` in `.env` and ensure PostgreSQL is running  
**Prisma error:** Run `npm run prisma:generate`

---

Built for 99Tech Code Challenge
