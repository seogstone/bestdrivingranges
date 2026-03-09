import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSubmission } from "@/lib/data/ranges";
import { normalizeCity } from "@/lib/utils/city";
import { derivePriceBucket } from "@/lib/utils/price";
import { submissionSchema } from "@/lib/validation/submissions";

function getIpAddress(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) {
    return "unknown";
  }

  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "unknown";
  const rateKey = `${getIpAddress(request)}:${userAgent}`;
  const limit = checkRateLimit(rateKey, { limit: 10, windowMs: 60_000 });

  if (!limit.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again shortly." },
      { status: 429 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  if (parsed.data.honeypot && parsed.data.honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const submissionInsert = {
    name: parsed.data.name,
    address: parsed.data.address,
    city: normalizeCity(parsed.data.city),
    postcode: parsed.data.postcode,
    facility_type: parsed.data.facility_type,
    bays: parsed.data.bays ?? null,
    covered_bays: parsed.data.covered_bays ?? null,
    floodlights: parsed.data.floodlights ?? null,
    short_game_area: parsed.data.short_game_area ?? null,
    simulator_brand: parsed.data.simulator_brand,
    price_100_balls: parsed.data.price_100_balls ?? null,
    price_bucket: derivePriceBucket(parsed.data.price_100_balls),
    website: parsed.data.website,
    phone: parsed.data.phone,
    opening_hours: parsed.data.opening_hours,
    images: parsed.data.images ?? [],
    submitter_email: parsed.data.submitter_email,
    status: "pending",
  };

  const result = await createSubmission(submissionInsert);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
