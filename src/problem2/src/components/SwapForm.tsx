import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Decimal from "decimal.js";
import { ArrowDownUp, Loader2, RefreshCw } from "lucide-react";
import { useTokenPrices } from "../hooks/useTokenPrices";
import { TokenSelect } from "./TokenSelect";
import { swapSchema, type SwapFormData } from "../types";

export function SwapForm() {
  const { tokens, loading, fetching, error, refetch } = useTokenPrices();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SwapFormData>({
    resolver: zodResolver(swapSchema),
    defaultValues: { amount: "", fromCurrency: "USD", toCurrency: "ETH" },
    mode: "onChange",
  });

  const [amount, fromCurrency, toCurrency] = watch(["amount", "fromCurrency", "toCurrency"]);

  const prices = useMemo(
    () => new Map(tokens.map((t) => [t.currency, t.price])),
    [tokens],
  );

  const received = useMemo(() => {
    try {
      const val = new Decimal(amount || "0");
      if (val.lte(0) || fromCurrency === toCurrency) return "";
      const fromPrice = prices.get(fromCurrency);
      const toPrice = prices.get(toCurrency);
      if (!fromPrice || !toPrice) return "";
      return val.mul(fromPrice).div(toPrice).toFixed(6);
    } catch {
      return "";
    }
  }, [amount, fromCurrency, toCurrency, prices]);

  const rate = useMemo(() => {
    const fromPrice = prices.get(fromCurrency);
    const toPrice = prices.get(toCurrency);
    if (!fromPrice || !toPrice || fromCurrency === toCurrency) return "";
    return new Decimal(fromPrice).div(toPrice).toFixed(6);
  }, [fromCurrency, toCurrency, prices]);

  function handleSwapDirection() {
    setValue("fromCurrency", toCurrency);
    setValue("toCurrency", fromCurrency);
  }

  function getButtonLabel() {
    if (isSubmitting) return "Swapping...";
    if (!amount) return "Enter an amount";
    if (errors.amount) return "Fix errors above";
    if (errors.toCurrency) return "Invalid pair";
    return "Swap";
  }

  const canSwap = !errors.amount && !errors.toCurrency && !!amount && !isSubmitting;

  async function onSubmit(data: SwapFormData) {
    await new Promise((r) => setTimeout(r, 1500));
    toast.success(`Swapped ${data.amount} ${data.fromCurrency} → ${received} ${data.toCurrency}`);
    reset({ amount: "", fromCurrency: data.fromCurrency, toCurrency: data.toCurrency });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-400">Failed to load tokens: {error}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-3xl bg-[#1c1930] p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Swap</h2>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={fetching || isSubmitting}
          title="Refresh prices"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className={`rounded-2xl bg-white/5 p-4 transition-colors ${errors.amount ? "ring-1 ring-red-500/50" : ""}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">You pay</span>
          <TokenSelect
            tokens={tokens}
            value={fromCurrency}
            onChange={(v) => setValue("fromCurrency", v, { shouldValidate: true })}
            disabled={isSubmitting}
          />
        </div>
        <input
          {...register("amount")}
          type="text"
          inputMode="decimal"
          placeholder="0"
          disabled={isSubmitting}
          className="w-full bg-transparent text-3xl font-light text-white outline-none placeholder:text-gray-600 disabled:opacity-50"
        />
      </div>
      {errors.amount && (
        <p className="mt-1.5 px-1 text-xs text-red-400">{errors.amount.message}</p>
      )}

      <div className="flex h-0 items-center justify-center">
        <button
          type="button"
          onClick={handleSwapDirection}
          disabled={isSubmitting}
          className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl border-4 border-[#1c1930] bg-[#252238] text-gray-300 transition hover:bg-[#302d48] hover:text-white disabled:opacity-50"
        >
          <ArrowDownUp className="h-4 w-4" />
        </button>
      </div>

      <div className={`rounded-2xl bg-white/5 p-4 transition-colors ${errors.toCurrency ? "ring-1 ring-amber-500/50" : ""}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">You receive</span>
          <TokenSelect
            tokens={tokens}
            value={toCurrency}
            onChange={(v) => setValue("toCurrency", v, { shouldValidate: true })}
            disabled={isSubmitting}
          />
        </div>
        <div className="text-3xl font-light text-white/60">{received || "0"}</div>
      </div>
      {errors.toCurrency && (
        <p className="mt-1.5 px-1 text-xs text-amber-400">{errors.toCurrency.message}</p>
      )}

      {rate && received && (
        <p className="mt-3 text-center text-xs text-gray-500">
          1 {fromCurrency} = {rate} {toCurrency}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSwap}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 py-4 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-gray-500"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {getButtonLabel()}
      </button>
    </form>
  );
}
