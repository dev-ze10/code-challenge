# Currency Swap

A modern DEX-style currency swap form built for a frontend interview challenge.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- TanStack Query (data fetching + caching)
- React Hook Form + Zod (validation)
- Decimal.js (precision arithmetic)
- Sonner (toast notifications)
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
  types.ts                    — TokenPrice interface + Zod schema
  hooks/useTokenPrices.ts     — Fetches, deduplicates (latest date), sorts token prices
  components/
    TokenSelect.tsx           — Token selector with SVG icons
    SwapForm.tsx              — Swap form with validation and mock submission
  App.tsx                     — QueryClient provider + Toaster + layout
```

## Features

- Fetches live token prices from Switcheo API
- Deduplicates tokens keeping the most recent price by date
- Precise conversion using Decimal.js (no floating point errors)
- Input validation with inline error messages
- Refresh prices button (background refetch via TanStack Query)
- Swap direction toggle
- Mock 1.5s backend submission with loading state
