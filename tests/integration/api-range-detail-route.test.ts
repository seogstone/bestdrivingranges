import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getRangeBySlug = vi.fn();
vi.mock("@/lib/data/ranges", () => ({
  getRangeBySlug,
}));

const { GET } = await import("@/app/api/ranges/[slug]/route");

describe("GET /api/ranges/[slug]", () => {
  it("returns not found when slug is missing", async () => {
    getRangeBySlug.mockResolvedValueOnce(null);

    const request = new NextRequest("https://example.com/api/ranges/example");
    const response = await GET(request, { params: Promise.resolve({ slug: "example" }) });

    expect(response.status).toBe(404);
  });

  it("returns detail payload", async () => {
    getRangeBySlug.mockResolvedValueOnce({
      range: { id: "1", name: "Example" },
      nearby: [],
    });

    const request = new NextRequest("https://example.com/api/ranges/example");
    const response = await GET(request, { params: Promise.resolve({ slug: "example" }) });

    expect(response.status).toBe(200);
  });
});
