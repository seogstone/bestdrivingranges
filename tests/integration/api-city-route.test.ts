import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getCityRanges = vi.fn();
vi.mock("@/lib/data/ranges", () => ({
  getCityRanges,
}));

const { GET } = await import("@/app/api/city/[city]/route");

describe("GET /api/city/[city]", () => {
  it("returns city payload", async () => {
    getCityRanges.mockResolvedValueOnce({ city: "London", ranges: [], total: 0, page: 1, pageSize: 20 });

    const request = new NextRequest("https://example.com/api/city/london?page=1");
    const response = await GET(request, { params: Promise.resolve({ city: "london" }) });

    expect(response.status).toBe(200);
    expect(getCityRanges).toHaveBeenCalledWith("london", expect.objectContaining({ page: 1 }));
  });
});
