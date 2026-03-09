import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth/admin";
import { listSubmissions } from "@/lib/data/ranges";
import type { SubmissionStatus } from "@/types/range";

const VALID_STATUSES = new Set<SubmissionStatus>(["pending", "approved", "rejected"]);

export async function GET(request: NextRequest) {
  const auth = await requireAdminFromRequest(request);
  if ("error" in auth) {
    return auth.error;
  }

  const requestedStatus = request.nextUrl.searchParams.get("status") ?? "pending";
  const status = VALID_STATUSES.has(requestedStatus as SubmissionStatus)
    ? (requestedStatus as SubmissionStatus)
    : "pending";

  const response = await listSubmissions(status);

  if (response.error) {
    return NextResponse.json({ error: response.error }, { status: 500 });
  }

  return NextResponse.json({ submissions: response.submissions, status });
}
