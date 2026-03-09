import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DirectoryMap } from "@/components/maps/directory-map";
import { RangeCard } from "@/components/range-card";
import { getRangeBySlug } from "@/lib/data/ranges";

interface RangeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RangeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getRangeBySlug(slug);

  if (!response) {
    return {
      title: "Range not found",
    };
  }

  return {
    title: `${response.range.name} (${response.range.city})`,
    description: `Details for ${response.range.name} in ${response.range.city}. Pricing, facilities, map, and nearby ranges.`,
    alternates: {
      canonical: `/range/${response.range.slug}`,
    },
  };
}

export default async function RangeDetailPage({ params }: RangeDetailPageProps) {
  const { slug } = await params;
  const response = await getRangeBySlug(slug);

  if (!response) {
    notFound();
  }

  const { range, nearby } = response;

  return (
    <section className="stack-lg">
      <header className="card stack-sm">
        <h1>{range.name}</h1>
        <p className="text-muted">
          {range.address}, {range.city} {range.postcode}
        </p>
        <div className="range-card-meta">
          <span>Facility: {range.facility_type}</span>
          <span>Covered bays: {range.covered_bays ? "Yes" : "No"}</span>
          <span>Floodlights: {range.floodlights ? "Yes" : "No"}</span>
          <span>Short game area: {range.short_game_area ? "Yes" : "No"}</span>
        </div>
        <p>
          Price (100 balls): {range.price_100_balls != null ? `£${range.price_100_balls.toFixed(2)}` : "Not listed"}
        </p>
        <p>
          Website: {range.website ? <a href={range.website}>{range.website}</a> : "Not listed"}
        </p>
      </header>

      <section className="stack-sm">
        <h2>Map</h2>
        <DirectoryMap ranges={[range]} height={360} />
      </section>

      <section className="stack-sm">
        <div className="section-row">
          <h2>Nearby in {range.city}</h2>
          <Link href="/ranges">Browse all ranges</Link>
        </div>
        {nearby.length === 0 ? (
          <p className="text-muted">No nearby ranges available.</p>
        ) : (
          <div className="results-grid">
            {nearby.map((item) => (
              <RangeCard key={item.id} range={item} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
