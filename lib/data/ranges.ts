import { citySlugToName, normalizeCity } from "@/lib/utils/city";
import { haversineDistanceKm } from "@/lib/utils/distance";
import { derivePriceBucket } from "@/lib/utils/price";
import { getAnonServerClient, getServiceRoleClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/utils/slug";
import type {
  CityResponse,
  Range,
  RangeDetailResponse,
  RangeFilters,
  RangeListResponse,
  SubmissionRecord,
  SubmissionStatus,
} from "@/types/range";

interface RangeQuery {
  eq(column: string, value: unknown): RangeQuery;
  ilike(column: string, value: string): RangeQuery;
  order(
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ): RangeQuery;
  range(
    from: number,
    to: number,
  ): Promise<{ data: unknown[] | null; error: unknown; count: number | null }>;
  limit(
    count: number,
  ): Promise<{ data: unknown[] | null; error: unknown; count: number | null }>;
}

function applyRangeFilters(query: RangeQuery, filters: RangeFilters): RangeQuery {
  if (filters.city) {
    query = query.eq("city", normalizeCity(filters.city));
  }

  if (filters.facilityType) {
    query = query.eq("facility_type", filters.facilityType);
  }

  if (filters.coveredBays !== undefined) {
    query = query.eq("covered_bays", filters.coveredBays);
  }

  if (filters.floodlights !== undefined) {
    query = query.eq("floodlights", filters.floodlights);
  }

  if (filters.shortGameArea !== undefined) {
    query = query.eq("short_game_area", filters.shortGameArea);
  }

  if (filters.simulatorBrand) {
    query = query.ilike("simulator_brand", filters.simulatorBrand);
  }

  if (filters.priceBucket) {
    query = query.eq("price_bucket", filters.priceBucket);
  }

  return query;
}

function applySort(query: RangeQuery, sort: NonNullable<RangeFilters["sort"]>): RangeQuery {
  switch (sort) {
    case "price_asc":
      return query.order("price_100_balls", { ascending: true, nullsFirst: false });
    case "price_desc":
      return query.order("price_100_balls", { ascending: false, nullsFirst: false });
    case "name_asc":
    default:
      return query.order("name", { ascending: true });
  }
}

function enrichDistance(ranges: Range[], filters: RangeFilters): Range[] {
  if (filters.lat == null || filters.lng == null) {
    return ranges;
  }

  return ranges.map((range) => ({
    ...range,
    distance_km: haversineDistanceKm(filters.lat!, filters.lng!, range.latitude, range.longitude),
  }));
}

export async function listRanges(filters: RangeFilters): Promise<RangeListResponse> {
  const client = getAnonServerClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;

  if (!client) {
    return { ranges: [], page, pageSize, total: 0 };
  }

  const base = applyRangeFilters(
    client
      .from("ranges")
      .select("*", { count: "exact" })
      .eq("is_published", true) as unknown as RangeQuery,
    filters,
  );

  const needsDistanceSort = filters.sort === "distance" && filters.lat != null && filters.lng != null;
  const needsRadiusFilter = filters.radiusKm != null && filters.lat != null && filters.lng != null;

  if (needsDistanceSort || needsRadiusFilter) {
    const { data, error, count } = await base.limit(2000);

    if (error || !data) {
      return { ranges: [], page, pageSize, total: 0 };
    }

    let ranges = enrichDistance(data as Range[], filters);

    if (needsRadiusFilter) {
      ranges = ranges.filter((range) => (range.distance_km ?? Number.MAX_SAFE_INTEGER) <= filters.radiusKm!);
    }

    if (needsDistanceSort) {
      ranges.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
    } else {
      ranges.sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = ranges.length || count || 0;
    const offset = (page - 1) * pageSize;

    return {
      ranges: ranges.slice(offset, offset + pageSize),
      page,
      pageSize,
      total,
    };
  }

  const offset = (page - 1) * pageSize;
  const query = applySort(base, filters.sort ?? "name_asc").range(offset, offset + pageSize - 1);
  const { data, error, count } = await query;

  if (error || !data) {
    return { ranges: [], page, pageSize, total: 0 };
  }

  return {
    ranges: data as Range[],
    page,
    pageSize,
    total: count ?? 0,
  };
}

export async function getRangeBySlug(slug: string): Promise<RangeDetailResponse | null> {
  const client = getAnonServerClient();
  if (!client) {
    return null;
  }

  const { data: range, error } = await client
    .from("ranges")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !range) {
    return null;
  }

  const { data: nearby } = await client
    .from("ranges")
    .select("*")
    .eq("city", range.city)
    .neq("id", range.id)
    .eq("is_published", true)
    .order("name", { ascending: true })
    .limit(6);

  return {
    range: range as Range,
    nearby: (nearby as Range[] | null) ?? [],
  };
}

export async function getCityRanges(citySlug: string, filters: RangeFilters): Promise<CityResponse> {
  const city = citySlugToName(citySlug);
  const response = await listRanges({ ...filters, city });

  return {
    city,
    total: response.total,
    ranges: response.ranges,
    page: response.page,
    pageSize: response.pageSize,
  };
}

export async function getFeaturedRanges(limit = 6): Promise<Range[]> {
  const response = await listRanges({ page: 1, pageSize: limit, sort: "name_asc" });
  return response.ranges;
}

export async function getPopularCities(limit = 12): Promise<string[]> {
  const client = getAnonServerClient();
  if (!client) {
    return [];
  }

  const { data } = await client
    .from("ranges")
    .select("city")
    .eq("is_published", true)
    .limit(5000);

  if (!data) {
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of data as { city: string }[]) {
    const city = normalizeCity(row.city);
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([city]) => city);
}

export async function createSubmission(payload: Record<string, unknown>) {
  const client = getAnonServerClient();
  if (!client) {
    return { ok: false, error: "Supabase environment is not configured" };
  }

  const { error } = await client.from("submissions").insert(payload);
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function listSubmissions(
  status: SubmissionStatus = "pending",
): Promise<{ submissions: SubmissionRecord[]; error?: string }> {
  const client = getServiceRoleClient();
  if (!client) {
    return { submissions: [], error: "Supabase environment is not configured" };
  }

  const { data, error } = await client
    .from("submissions")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: true });

  if (error) {
    return { submissions: [], error: error.message };
  }

  return { submissions: (data as SubmissionRecord[]) ?? [] };
}

async function nextUniqueSlug(baseSlug: string): Promise<string> {
  const client = getServiceRoleClient();
  if (!client) {
    return baseSlug;
  }

  let candidate = baseSlug;
  let suffix = 1;

  while (suffix < 100) {
    const { data } = await client.from("ranges").select("id").eq("slug", candidate).maybeSingle();
    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return `${baseSlug}-${Date.now()}`;
}

export async function approveSubmission(
  submissionId: string,
  reviewerId: string,
  reviewNotes?: string,
): Promise<{ ok: boolean; error?: string }> {
  const client = getServiceRoleClient();
  if (!client) {
    return { ok: false, error: "Supabase environment is not configured" };
  }

  const { data: submission, error: submissionError } = await client
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("status", "pending")
    .maybeSingle();

  if (submissionError || !submission) {
    return { ok: false, error: "Submission not found or already reviewed" };
  }

  const baseSlug = toSlug(`${submission.name}-${submission.city}`);
  const slug = await nextUniqueSlug(baseSlug);

  const rangeInsert = {
    name: submission.name,
    slug,
    address: submission.address,
    city: normalizeCity(submission.city),
    postcode: submission.postcode,
    latitude: submission.latitude ?? 0,
    longitude: submission.longitude ?? 0,
    facility_type: submission.facility_type,
    bays: submission.bays,
    covered_bays: submission.covered_bays ?? false,
    floodlights: submission.floodlights ?? false,
    short_game_area: submission.short_game_area ?? false,
    simulator_brand: submission.simulator_brand,
    price_100_balls: submission.price_100_balls,
    price_bucket: derivePriceBucket(submission.price_100_balls),
    website: submission.website,
    phone: submission.phone,
    opening_hours: submission.opening_hours,
    image: Array.isArray(submission.images) && submission.images.length > 0 ? submission.images[0] : null,
    is_published: true,
  };

  const { error: rangeError } = await client.from("ranges").insert(rangeInsert);
  if (rangeError) {
    return { ok: false, error: rangeError.message };
  }

  const { error: submissionUpdateError } = await client
    .from("submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      review_notes: reviewNotes ?? null,
    })
    .eq("id", submissionId);

  if (submissionUpdateError) {
    return { ok: false, error: submissionUpdateError.message };
  }

  return { ok: true };
}

export async function rejectSubmission(
  submissionId: string,
  reviewerId: string,
  reviewNotes?: string,
): Promise<{ ok: boolean; error?: string }> {
  const client = getServiceRoleClient();
  if (!client) {
    return { ok: false, error: "Supabase environment is not configured" };
  }

  const { error } = await client
    .from("submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
      review_notes: reviewNotes ?? null,
    })
    .eq("id", submissionId)
    .eq("status", "pending");

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
