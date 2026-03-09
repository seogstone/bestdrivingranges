import { describe, expect, it } from "vitest";
import { toSlug } from "@/lib/utils/slug";

describe("toSlug", () => {
  it("normalizes and hyphenates values", () => {
    expect(toSlug("  The Range @ London! ")).toBe("the-range-london");
  });

  it("removes accent marks", () => {
    expect(toSlug("Golf à côté")).toBe("golf-a-cote");
  });
});
