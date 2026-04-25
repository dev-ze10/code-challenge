// A: Gauss's formula — O(1) time, O(1) space
function sum_to_n_a(n: number): number {
  if (n <= 0) return 0;
  const m = Math.floor(n);
  return (m * (m + 1)) / 2;
}

// B: Iterative loop — O(n) time, O(1) space
function sum_to_n_b(n: number): number {
  if (n <= 0) return 0;
  const m = Math.floor(n);
  let sum = 0;
  for (let i = 1; i <= m; i++) sum += i;
  return sum;
}

// C: Functional (Array.from + reduce) — O(n) time, O(n) space (~22MB at n=1M)
function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  const m = Math.floor(n);
  return Array.from({ length: m }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
}

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
