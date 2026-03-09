import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const checkRateLimit = vi.fn();
const createSubmission = vi.fn();

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit,
}));

vi.mock("@/lib/data/ranges", () => ({
  createSubmission,
}));

const { POST } = await import("@/app/api/submissions/route");

describe("POST /api/submissions", () => {
  it("returns 429 when over rate limit", async () => {
    checkRateLimit.mockReturnValueOnce({ ok: false, remaining: 0, resetAt: Date.now() + 1000 });

    const request = new NextRequest("https://example.com/api/submissions", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
  });

  it("accepts a valid payload", async () => {
    checkRateLimit.mockReturnValueOnce({ ok: true, remaining: 9, resetAt: Date.now() + 1000 });
    createSubmission.mockResolvedValueOnce({ ok: true });

    const request = new NextRequest("https://example.com/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "City Range",
        address: "123 Example St",
        city: "London",
        postcode: "SW1A1AA",
        facility_type: "outdoor",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(createSubmission).toHaveBeenCalled();
  });
});
