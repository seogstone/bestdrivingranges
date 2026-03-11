import fs from "node:fs/promises";
import path from "node:path";
import { toSlug } from "../lib/utils/slug";

type OsmTags = Record<string, string | undefined>;

interface OsmElement {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OsmTags;
}

interface OsmResponse {
  elements: OsmElement[];
}

interface CsvRow {
  name: string;
  slug: string;
  address: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
  facility_type: "outdoor" | "indoor" | "both";
  bays: string;
  covered_bays: "true" | "false";
  floodlights: "true" | "false";
  short_game_area: "true" | "false";
  simulator_brand: string;
  price_100_balls: string;
  website: string;
  phone: string;
  opening_hours: string;
  image: string;
  is_published: "true";
}

const OVERPASS_ENDPOINTS = [
  process.env.OVERPASS_URL,
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
].filter((value): value is string => Boolean(value));

const query = `
[out:json][timeout:240];
(
  node["golf"="driving_range"](49.8,-8.8,60.95,2.1);
  way["golf"="driving_range"](49.8,-8.8,60.95,2.1);
  relation["golf"="driving_range"](49.8,-8.8,60.95,2.1);
  node["golf"="simulator"](49.8,-8.8,60.95,2.1);
  way["golf"="simulator"](49.8,-8.8,60.95,2.1);
  relation["golf"="simulator"](49.8,-8.8,60.95,2.1);
);
out center tags;
`;

function toBool(value: string | undefined): "true" | "false" {
  return value?.toLowerCase() === "yes" ? "true" : "false";
}

function clean(value: string | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function deriveCity(tags: OsmTags): string {
  return (
    clean(tags["addr:city"]) ||
    clean(tags["addr:town"]) ||
    clean(tags["addr:village"]) ||
    clean(tags["addr:county"]) ||
    "Unknown"
  );
}

function deriveAddress(tags: OsmTags): string {
  const parts = [
    clean(tags["addr:housenumber"]),
    clean(tags["addr:street"]),
    clean(tags["addr:suburb"]),
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  return clean(tags["addr:full"]) || clean(tags["name"]) || "Address unavailable";
}

function deriveFacilityType(tags: OsmTags): "outdoor" | "indoor" | "both" {
  if (clean(tags.golf) === "simulator") {
    return "indoor";
  }

  const indoor = clean(tags.indoor);
  if (indoor === "yes") {
    return "indoor";
  }

  if (indoor === "no") {
    return "outdoor";
  }

  return "outdoor";
}

function rowFromElement(element: OsmElement): CsvRow | null {
  const tags = element.tags ?? {};
  const name = clean(tags.name);

  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;

  if (!name || lat == null || lon == null) {
    return null;
  }

  const city = deriveCity(tags);
  const postcode = clean(tags["addr:postcode"]) || "UNKNOWN";
  const facilityType = deriveFacilityType(tags);

  const simulatorBrand =
    clean(tags["simulator:brand"]) ||
    (facilityType === "indoor" ? clean(tags.brand) : "");

  return {
    name,
    slug: toSlug(`${name}-${city}`),
    address: deriveAddress(tags),
    city,
    postcode,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
    facility_type: facilityType,
    bays: clean(tags.bays),
    covered_bays: toBool(tags.covered),
    floodlights: toBool(tags.lit),
    short_game_area: "false",
    simulator_brand: simulatorBrand,
    price_100_balls: "",
    website: clean(tags.website),
    phone: clean(tags.phone),
    opening_hours: clean(tags.opening_hours),
    image: clean(tags.image),
    is_published: "true",
  };
}

function dedupeRows(rows: CsvRow[]): CsvRow[] {
  const slugCounts = new Map<string, number>();
  const seen = new Set<string>();
  const deduped: CsvRow[] = [];

  for (const row of rows) {
    const key = `${row.name.toLowerCase()}|${row.latitude}|${row.longitude}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const count = slugCounts.get(row.slug) ?? 0;
    slugCounts.set(row.slug, count + 1);
    if (count > 0) {
      row.slug = `${row.slug}-${count}`;
    }

    deduped.push(row);
  }

  return deduped;
}

async function main() {
  const outputArg = process.argv[2] ?? "data/uk-driving-ranges-osm.csv";
  const outputPath = path.resolve(process.cwd(), outputArg);

  let payload: OsmResponse | null = null;
  const failures: string[] = [];

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "text/plain;charset=UTF-8",
      },
      body: query,
    });

    if (!response.ok) {
      failures.push(`${endpoint} -> ${response.status} ${response.statusText}`);
      continue;
    }

    payload = (await response.json()) as OsmResponse;
    break;
  }

  if (!payload) {
    throw new Error(`All Overpass endpoints failed: ${failures.join(" | ")}`);
  }
  const rows = dedupeRows(
    payload.elements
      .map(rowFromElement)
      .filter((row): row is CsvRow => row !== null),
  );

  const header = [
    "name",
    "slug",
    "address",
    "city",
    "postcode",
    "latitude",
    "longitude",
    "facility_type",
    "bays",
    "covered_bays",
    "floodlights",
    "short_game_area",
    "simulator_brand",
    "price_100_balls",
    "website",
    "phone",
    "opening_hours",
    "image",
    "is_published",
  ];

  const lines = [header.join(",")];

  for (const row of rows) {
    const ordered = [
      row.name,
      row.slug,
      row.address,
      row.city,
      row.postcode,
      String(row.latitude),
      String(row.longitude),
      row.facility_type,
      row.bays,
      row.covered_bays,
      row.floodlights,
      row.short_game_area,
      row.simulator_brand,
      row.price_100_balls,
      row.website,
      row.phone,
      row.opening_hours,
      row.image,
      row.is_published,
    ];

    lines.push(ordered.map(csvEscape).join(","));
  }

  await fs.writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");

  process.stdout.write(
    `${JSON.stringify({ output: outputPath, records: rows.length }, null, 2)}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
