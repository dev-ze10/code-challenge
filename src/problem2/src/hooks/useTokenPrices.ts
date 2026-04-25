import { useQuery } from "@tanstack/react-query";
import type { TokenPrice } from "../types";

async function fetchTokenPrices(): Promise<TokenPrice[]> {
  const res = await fetch("https://interview.switcheo.com/prices.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: TokenPrice[] = await res.json();

  const latest = new Map<string, TokenPrice>();
  for (const t of data) {
    if (t.price == null || t.price <= 0) continue;
    const existing = latest.get(t.currency);
    if (!existing || t.date > existing.date) {
      latest.set(t.currency, t);
    }
  }

  return Array.from(latest.values()).sort((a, b) =>
    a.currency.localeCompare(b.currency),
  );
}

export function useTokenPrices() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["token-prices"],
    queryFn: fetchTokenPrices,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  return {
    tokens: data ?? [],
    loading: isLoading,
    fetching: isFetching,
    error: error?.message ?? null,
    refetch,
  };
}
