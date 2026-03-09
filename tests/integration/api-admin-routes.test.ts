import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const requireAdminFromRequest = vi.fn();
const listSubmissions = vi.fn();
const approveSubmission = vi.fn();
const rejectSubmission = vi.fn();

vi.mock("@/lib/auth/admin", () => ({
  requireAdminFromRequest,
}));

vi.mock("@/lib/data/ranges", () => ({
  listSubmissions,
  approveSubmission,
  rejectSubmission,
}));

const { GET } = await import("@/app/api/admin/submissions/route");
const { POST: approvePost } = await import("@/app/api/admin/submissions/[id]/approve/route");
const { POST: rejectPost } = await import("@/app/api/admin/submissions/[id]/reject/route");

describe("admin submission routes", () => {
  it("blocks unauthorized list access", async () => {
    requireAdminFromRequest.mockResolvedValueOnce({
      error: Response.json({ error: "Forbidden" }, { status: 403 }),
    });

    const response = await GET(new NextRequest("https://example.com/api/admin/submissions"));
    expect(response.status).toBe(403);
  });

  it("lists pending submissions for admin", async () => {
    requireAdminFromRequest.mockResolvedValueOnce({ admin: { id: "1", email: "a@b.com", role: "admin" } });
    listSubmissions.mockResolvedValueOnce({ submissions: [] });

    const response = await GET(new NextRequest("https://example.com/api/admin/submissions"));
    expect(response.status).toBe(200);
    expect(listSubmissions).toHaveBeenCalledWith("pending");
  });

  it("approves submission", async () => {
    requireAdminFromRequest.mockResolvedValueOnce({ admin: { id: "1", email: "a@b.com", role: "admin" } });
    approveSubmission.mockResolvedValueOnce({ ok: true });

    const response = await approvePost(
      new NextRequest("https://example.com/api/admin/submissions/x/approve", {
        method: "POST",
        body: JSON.stringify({ reviewNotes: "ok" }),
      }),
      { params: Promise.resolve({ id: "x" }) },
    );

    expect(response.status).toBe(200);
    expect(approveSubmission).toHaveBeenCalledWith("x", "1", "ok");
  });

  it("rejects submission", async () => {
    requireAdminFromRequest.mockResolvedValueOnce({ admin: { id: "1", email: "a@b.com", role: "admin" } });
    rejectSubmission.mockResolvedValueOnce({ ok: true });

    const response = await rejectPost(
      new NextRequest("https://example.com/api/admin/submissions/y/reject", {
        method: "POST",
        body: JSON.stringify({ reviewNotes: "bad" }),
      }),
      { params: Promise.resolve({ id: "y" }) },
    );

    expect(response.status).toBe(200);
    expect(rejectSubmission).toHaveBeenCalledWith("y", "1", "bad");
  });
});
