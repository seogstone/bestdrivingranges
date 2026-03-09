import { NextRequest, NextResponse } from "next/server";
import { getRangeBySlug } from "@/lib/data/ranges";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;
  const response = await getRangeBySlug(slug);

  if (!response) {
    return NextResponse.json({ error: "Range not found" }, { status: 404 });
  }

  return NextResponse.json(response);
}
