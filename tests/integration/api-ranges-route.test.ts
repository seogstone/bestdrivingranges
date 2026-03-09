import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const listRanges = vi.fn();
vi.mock("@/lib/data/ranges", () => ({
  listRanges,
}));

const { GET } = await import("@/app/api/ranges/route");

describe("GET /api/ranges", () => {
  it("returns parsed range list payload", async () => {
    listRanges.mockResolvedValueOnce({ ranges: [], page: 1, pageSize: 20, total: 0 });

    const request = new NextRequest("https://example.com/api/ranges?city=London&coveredBays=true");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(listRanges).toHaveBeenCalledWith(expect.objectContaining({ city: "London", coveredBays: true }));
  });
});
