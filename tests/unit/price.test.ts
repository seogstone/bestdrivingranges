import { describe, expect, it } from "vitest";
import { derivePriceBucket } from "@/lib/utils/price";

describe("derivePriceBucket", () => {
  it("maps ranges", () => {
    expect(derivePriceBucket(null)).toBe("unknown");
    expect(derivePriceBucket(7.99)).toBe("budget");
    expect(derivePriceBucket(10)).toBe("mid");
    expect(derivePriceBucket(14)).toBe("premium");
  });
});
