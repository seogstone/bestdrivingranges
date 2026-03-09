import type { FacilityType, PriceBucket, RangeFilters } from "@/types/range";

const FACILITY_TYPES = new Set<FacilityType>(["outdoor", "indoor", "both"]);
const PRICE_BUCKETS = new Set<PriceBucket>(["budget", "mid", "premium", "unknown"]);
const SORTS = new Set<NonNullable<RangeFilters["sort"]>>([
  "name_asc",
  "price_asc",
  "price_desc",
  "distance",
]);

function parseBoolean(value: string | null): boolean | undefined {
  if (value == null) {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function parseNumber(value: string | null): number | undefined {
  if (value == null || value.trim() === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseRangeFilters(params: URLSearchParams): RangeFilters {
  const facilityType = params.get("facilityType");
  const priceBucket = params.get("priceBucket");
  const sort = params.get("sort");
  const parsedSort =
    sort && SORTS.has(sort as NonNullable<RangeFilters["sort"]>)
      ? (sort as NonNullable<RangeFilters["sort"]>)
      : "name_asc";

  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(params.get("pageSize") ?? "20", 10) || 20),
  );

  return {
    city: params.get("city") ?? undefined,
    facilityType:
      facilityType && FACILITY_TYPES.has(facilityType as FacilityType)
        ? (facilityType as FacilityType)
        : undefined,
    coveredBays: parseBoolean(params.get("coveredBays")),
    floodlights: parseBoolean(params.get("floodlights")),
    shortGameArea: parseBoolean(params.get("shortGameArea")),
    simulatorBrand: params.get("simulatorBrand") ?? undefined,
    priceBucket:
      priceBucket && PRICE_BUCKETS.has(priceBucket as PriceBucket)
        ? (priceBucket as PriceBucket)
        : undefined,
    lat: parseNumber(params.get("lat")),
    lng: parseNumber(params.get("lng")),
    radiusKm: parseNumber(params.get("radiusKm")),
    page,
    pageSize,
    sort: parsedSort,
  };
}
