import http from 'node:http';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DURATION_MS = 10_000;
const CONCURRENCY = 10;

interface BenchResult {
  name: string;
  requests: number;
  errors: number;
  opsPerSec: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
}

function request(method: string, path: string, body?: object): Promise<{ status: number; latencyMs: number }> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const start = performance.now();
    const req = http.request(new URL(path, BASE_URL), {
      method,
      headers: data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {},
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk: Buffer) => responseBody += chunk);
      res.on('end', () => resolve({ status: res.statusCode!, latencyMs: performance.now() - start }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function fetchJson<T = any>(path: string): Promise<T> {
  return new Promise((resolve, reject) => {
    http.get(new URL(path, BASE_URL), (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

async function benchmark(name: string, fn: () => Promise<{ status: number; latencyMs: number }>): Promise<BenchResult> {
  const latencies: number[] = [];
  let requests = 0, errors = 0;

  for (let i = 0; i < 5; i++) await fn();

  const deadline = performance.now() + DURATION_MS;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (performance.now() < deadline) {
      try {
        const { status, latencyMs } = await fn();
        latencies.push(latencyMs);
        if (status >= 400) errors++;
      } catch {
        errors++;
      } finally {
        requests++;
      }
    }
  }));

  latencies.sort((a, b) => a - b);
  return {
    name,
    requests,
    errors,
    opsPerSec: Math.round((requests / DURATION_MS) * 1000),
    avgLatencyMs: +(latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2),
    p99LatencyMs: +(latencies[Math.floor(latencies.length * 0.99)] ?? 0).toFixed(2),
  };
}

async function run() {
  console.log(`Benchmark: ${BASE_URL} | ${DURATION_MS / 1000}s/test | ${CONCURRENCY} workers\n`);

  try {
    await request('GET', '/health');
  } catch {
    console.error('Server not running. Start with: npm run dev');
    process.exit(1);
  }

  const results: BenchResult[] = [];
  let counter = 0;

  results.push(await benchmark('POST   /api/posts', () =>
    request('POST', '/api/posts', { title: `Post ${counter++}`, content: 'Benchmark', author: 'bench', tags: ['test'] })
  ));

  results.push(await benchmark('GET    /api/posts', () =>
    request('GET', '/api/posts?page=1&limit=10')
  ));

  results.push(await benchmark('GET    /api/posts?filter', () =>
    request('GET', '/api/posts?status=DRAFT&author=bench&page=1&limit=10')
  ));

  await request('POST', '/api/posts', { title: 'Target', content: 'x', author: 'bench' });
  const { data } = await fetchJson<{ data: Array<{ id: string }> }>('/api/posts?author=bench&limit=1');
  const postId = data[0]?.id;

  if (postId) {
    results.push(await benchmark('GET    /api/posts/:id', () =>
      request('GET', `/api/posts/${postId}`)
    ));

    let updateCounter = 0;
    results.push(await benchmark('PUT    /api/posts/:id', () =>
      request('PUT', `/api/posts/${postId}`, { title: `Updated ${updateCounter++}` })
    ));
  }

  results.push(await benchmark('DELETE /api/posts/:id', async () => {
    const { data: created } = await fetchJson<{ data: { id: string } }>(
      '/api/posts?author=bench&limit=1'
    );
    if (!created?.id) throw new Error('No post to delete');
    return request('DELETE', `/api/posts/${created.id}`);
  }));

  console.log('─'.repeat(90));
  console.log('Endpoint'.padEnd(38), 'Reqs'.padStart(8), 'Ops/s'.padStart(8), 'Avg(ms)'.padStart(10), 'P99(ms)'.padStart(10), 'Errors'.padStart(8));
  console.log('─'.repeat(90));
  results.forEach(r =>
    console.log(r.name.padEnd(38), String(r.requests).padStart(8), String(r.opsPerSec).padStart(8), String(r.avgLatencyMs).padStart(10), String(r.p99LatencyMs).padStart(10), String(r.errors).padStart(8))
  );
  console.log('─'.repeat(90));
}

run().catch(console.error);
