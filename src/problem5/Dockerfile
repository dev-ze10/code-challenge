# ── Dev stage ──
FROM node:24-alpine AS dev

WORKDIR /app

# Install all dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Source code is bind-mounted via docker-compose, not copied
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]

# ── Build stage ──
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
RUN npm run build

# ── Production stage ──
FROM node:24-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
