import { describe, expect, it } from "vitest";
import { citySlugToName, cityToSlug, normalizeCity } from "@/lib/utils/city";

describe("city utils", () => {
  it("normalizes spacing and casing", () => {
    expect(normalizeCity("  manchester  city ")).toBe("Manchester City");
  });

  it("converts to and from slug", () => {
    expect(cityToSlug("Birmingham")).toBe("birmingham");
    expect(citySlugToName("newcastle-upon-tyne")).toBe("Newcastle Upon Tyne");
  });
});
