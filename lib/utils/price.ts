import type { PriceBucket } from "@/types/range";

export function derivePriceBucket(price100Balls: number | null | undefined): PriceBucket {
  if (price100Balls == null || Number.isNaN(price100Balls)) {
    return "unknown";
  }

  if (price100Balls < 8) {
    return "budget";
  }

  if (price100Balls <= 12) {
    return "mid";
  }

  return "premium";
}
