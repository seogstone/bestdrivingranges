import { describe, expect, it } from "vitest";
import { parseRangeFilters } from "@/lib/utils/filters";

describe("parseRangeFilters", () => {
  it("parses booleans, numbers and defaults", () => {
    const filters = parseRangeFilters(
      new URLSearchParams({
        city: "Leeds",
        coveredBays: "true",
        floodlights: "false",
        radiusKm: "25",
        page: "0",
        pageSize: "999",
      }),
    );

    expect(filters.city).toBe("Leeds");
    expect(filters.coveredBays).toBe(true);
    expect(filters.floodlights).toBe(false);
    expect(filters.radiusKm).toBe(25);
    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(100);
    expect(filters.sort).toBe("name_asc");
  });
});
