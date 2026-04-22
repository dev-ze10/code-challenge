import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum_to_n";

const N = 1_000_000;
let passed = 0;
let failed = 0;

// --- Helpers ---

function assert(label: string, actual: number, expected: number) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.error(`  FAIL: ${label} — got ${actual}, want ${expected}`);
  }
}

function formatBytes(bytes: number): string {
  const sign = bytes < 0 ? "-" : "+";
  const abs = Math.abs(bytes);

  if (abs < 1024) return `${sign}${abs} B`;
  if (abs < 1024 * 1024) return `${sign}${(abs / 1024).toFixed(1)} KB`;
  return `${sign}${(abs / (1024 * 1024)).toFixed(1)} MB`;
}

function bench(label: string, fn: (n: number) => number, iters: number) {
  const start = performance.now();
  for (let i = 0; i < iters; i++) {
    fn(N);
  }
  const ms = (performance.now() - start) / iters;

  console.log(`  ${label.padEnd(20)} ${ms.toFixed(6)} ms/call`);
  return ms;
}

function memBench(label: string, fn: (n: number) => number) {
  if (typeof globalThis.gc === "function") globalThis.gc();

  const before = process.memoryUsage().heapUsed;
  fn(N);
  const after = process.memoryUsage().heapUsed;

  console.log(`  ${label.padEnd(20)} ${formatBytes(after - before)} heap`);
}

// --- Correctness ---

const fns = [
  { name: "A (formula)", fn: sum_to_n_a },
  { name: "B (loop)", fn: sum_to_n_b },
  { name: "C (functional)", fn: sum_to_n_c },
];

const cases: [number, number][] = [
  [0, 0],
  [1, 1],
  [2, 3],
  [3, 6],
  [5, 15],
  [10, 55],
  [100, 5050],
  [1000, 500500],
  [10000, 50005000],
];

console.log("=== Correctness ===\n");

for (const { name, fn } of fns) {
  console.log(name);
  for (const [n, expected] of cases) {
    assert(`${name}(${n})`, fn(n), expected);
  }
}

assert("cross-check A===B", sum_to_n_a(N), sum_to_n_b(N));
assert("cross-check A===C", sum_to_n_a(N), sum_to_n_c(N));

// --- Speed ---

console.log("\n=== Speed (n = 1,000,000) ===\n");

bench("A (formula)", sum_to_n_a, 10_000_000);
const timeB = bench("B (loop)", sum_to_n_b, 100);
const timeC = bench("C (functional)", sum_to_n_c, 100);

console.log(`\n  C is ${(timeC / timeB).toFixed(1)}x slower than B`);

// --- Memory ---

console.log("\n=== Memory (n = 1,000,000) ===\n");

memBench("A (formula)", sum_to_n_a);
memBench("B (loop)", sum_to_n_b);
memBench("C (functional)", sum_to_n_c);

// --- Summary ---

console.log(`\n=== ${passed} passed, ${failed} failed ===`);
if (failed) process.exit(1);
