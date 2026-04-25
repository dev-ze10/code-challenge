import { ChevronDown } from "lucide-react";
import type { TokenPrice } from "../types";

const ICON_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";

interface TokenSelectProps {
  tokens: TokenPrice[];
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
}

export function TokenSelect({ tokens, value, onChange, disabled }: TokenSelectProps) {
  return (
    <div className="relative flex items-center gap-2">
      <img
        src={`${ICON_URL}/${value}.svg`}
        alt=""
        className="h-6 w-6 rounded-full"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="appearance-none bg-transparent pr-5 text-sm font-semibold text-white outline-none disabled:opacity-50"
      >
        {tokens.map((t) => (
          <option key={t.currency} value={t.currency} className="bg-[#1c1930] text-white">
            {t.currency}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-gray-400" />
    </div>
  );
}
