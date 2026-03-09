import { NextRequest, NextResponse } from "next/server";
import { getCityRanges } from "@/lib/data/ranges";
import { parseRangeFilters } from "@/lib/utils/filters";

interface Params {
  params: Promise<{ city: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { city } = await params;
  const filters = parseRangeFilters(request.nextUrl.searchParams);
  const response = await getCityRanges(city, filters);

  return NextResponse.json(response);
}
