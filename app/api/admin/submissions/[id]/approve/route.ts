import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth/admin";
import { approveSubmission } from "@/lib/data/ranges";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAdminFromRequest(request);
  if ("error" in auth) {
    return auth.error;
  }

  const { id } = await params;

  let payload: { reviewNotes?: string } = {};
  try {
    payload = (await request.json()) as { reviewNotes?: string };
  } catch {
    payload = {};
  }

  const result = await approveSubmission(id, auth.admin.id, payload.reviewNotes);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
