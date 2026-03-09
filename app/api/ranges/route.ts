import { NextRequest, NextResponse } from "next/server";
import { listRanges } from "@/lib/data/ranges";
import { parseRangeFilters } from "@/lib/utils/filters";

export async function GET(request: NextRequest) {
  const filters = parseRangeFilters(request.nextUrl.searchParams);
  const response = await listRanges(filters);

  return NextResponse.json(response);
}
