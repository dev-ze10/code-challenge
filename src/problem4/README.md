# Problem 4 -- Three Ways to Sum to N

Return the summation from 1 to `n`. Example: `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

## Implementations

### A -- Gauss's Formula | O(1) time | O(1) space

```ts
function sum_to_n_a(n: number): number {
  return (n * (n + 1)) / 2;
}
```

Mathematical identity -- single arithmetic expression, no loops, no allocations.
The fastest possible approach.

### B -- Iterative Loop | O(n) time | O(1) space

```ts
function sum_to_n_b(n: number): number {
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}
```

Accumulates the sum in one pass. Simple, readable, stack-safe.
Uses only one variable regardless of `n`.

### C -- Functional (Array.from + reduce) | O(n) time | O(n) space

```ts
function sum_to_n_c(n: number): number {
  return Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
}
```

Builds `[1, 2, ..., n]` then reduces to a sum. Idiomatic functional style, but
the least efficient -- two passes over the data and allocates the entire array
in memory before summing (~22 MB at n=1M vs ~8 KB for the loop).

## Benchmark Summary
With N = 1_000_000

| | Time (n=1M) | Heap memory |
|---|---|---|
| **A** formula | 0.4 ns/call | ~0 KB |
| **B** loop | ~4,800 us/call | ~8 KB |
| **C** functional | ~26,000 us/call | **~22 MB** |

C is **5.4x slower** than B and uses **~2,800x more memory** for the same result.

## Run

```bash
npx tsx sum_to_n.test.ts
```

## Full Test Output

```
=== Correctness ===

A (formula)
B (loop)
C (functional)

=== Speed (n = 1,000,000) ===

  A (formula)          0.000000 ms/call
  B (loop)             4.853676 ms/call
  C (functional)       25.950360 ms/call

  C is 5.3x slower than B

=== Memory (n = 1,000,000) ===

  A (formula)          +3.2 KB heap
  B (loop)             +7.7 KB heap
  C (functional)       +21.9 MB heap

=== 29 passed, 0 failed ===
```

## Files

| File | Description |
|------|-------------|
| `sum_to_n.ts` | Three implementations |
| `sum_to_n.test.ts` | Correctness + speed + memory benchmarks |
