import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import { config as dotenvConfig } from "dotenv";
import { derivePriceBucket } from "../lib/utils/price";
import { normalizeCity } from "../lib/utils/city";
import { toSlug } from "../lib/utils/slug";

interface CsvRow {
  name: string;
  slug?: string;
  address: string;
  city: string;
  postcode: string;
  latitude: string;
  longitude: string;
  facility_type: "outdoor" | "indoor" | "both";
  bays?: string;
  covered_bays?: string;
  floodlights?: string;
  short_game_area?: string;
  simulator_brand?: string;
  price_100_balls?: string;
  website?: string;
  phone?: string;
  opening_hours?: string;
  image?: string;
  is_published?: string;
}

interface ImportReport {
  inserted: number;
  updated: number;
  failed: Array<{ row: number; reason: string }>;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value == null || value === "") {
    return fallback;
  }

  return value.toLowerCase() === "true";
}

function parseNullableNumber(value: string | undefined): number | null {
  if (!value || value.trim() === "") {
    return null;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function main() {
  dotenvConfig({ path: path.resolve(process.cwd(), ".env.local") });
  dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

  const fileArg = process.argv[2] ?? "data/ranges-template.csv";
  const csvPath = path.resolve(process.cwd(), fileArg);

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const rawCsv = await fs.readFile(csvPath, "utf8");
  const rows = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const report: ImportReport = {
    inserted: 0,
    updated: 0,
    failed: [],
  };

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;

    try {
      if (!row.name || !row.address || !row.city || !row.postcode || !row.latitude || !row.longitude) {
        throw new Error("Missing required columns");
      }

      if (!["outdoor", "indoor", "both"].includes(row.facility_type)) {
        throw new Error(`Invalid facility_type: ${row.facility_type}`);
      }

      const latitude = Number(row.latitude);
      const longitude = Number(row.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("Invalid coordinates");
      }

      const city = normalizeCity(row.city);
      const baseSlug = row.slug?.trim() ? row.slug.trim() : toSlug(`${row.name}-${city}`);
      const slug = toSlug(baseSlug);
      if (!slug) {
        throw new Error("Could not derive slug");
      }

      const price100 = parseNullableNumber(row.price_100_balls);

      const payload = {
        name: row.name,
        slug,
        address: row.address,
        city,
        postcode: row.postcode,
        latitude,
        longitude,
        facility_type: row.facility_type,
        bays: parseNullableNumber(row.bays),
        covered_bays: parseBoolean(row.covered_bays),
        floodlights: parseBoolean(row.floodlights),
        short_game_area: parseBoolean(row.short_game_area),
        simulator_brand: row.simulator_brand || null,
        price_100_balls: price100,
        price_bucket: derivePriceBucket(price100),
        website: row.website || null,
        phone: row.phone || null,
        opening_hours: row.opening_hours || null,
        image: row.image || null,
        is_published: parseBoolean(row.is_published, true),
      };

      const { data: existing } = await supabase
        .from("ranges")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      const { error } = await supabase.from("ranges").upsert(payload, {
        onConflict: "slug",
      });

      if (error) {
        throw new Error(error.message);
      }

      if (existing) {
        report.updated += 1;
      } else {
        report.inserted += 1;
      }
    } catch (error) {
      report.failed.push({
        row: rowNumber,
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (report.failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
