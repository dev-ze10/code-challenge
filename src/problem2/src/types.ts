import { z } from "zod";

export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

export const swapSchema = z.object({
  amount: z
    .string()
    .min(1, "Enter an amount")
    .regex(/^\d+\.?\d*$|^\d*\.\d+$/, "Please enter a valid number")
    .refine((v) => parseFloat(v) > 0, "Amount must be greater than zero"),
  fromCurrency: z.string(),
  toCurrency: z.string(),
}).refine((data) => data.fromCurrency !== data.toCurrency, {
  message: "Select different tokens",
  path: ["toCurrency"],
});

export type SwapFormData = z.infer<typeof swapSchema>;
