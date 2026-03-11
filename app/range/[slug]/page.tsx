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
      <header className="hero animate-in" style={{ padding: "4rem 2rem", textAlign: "left", alignItems: "flex-start" }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow">{range.facility_type}</span>
          <h1 style={{ marginTop: "0.5rem" }}>{range.name}</h1>
          <p className="text-muted" style={{ marginTop: "0.5rem" }}>
            {range.address}, {range.city} {range.postcode}
          </p>
          
          <div className="range-card-meta" style={{ marginTop: "1.5rem" }}>
            {range.covered_bays && <span className="meta-tag">☔ Covered Bays</span>}
            {range.floodlights && <span className="meta-tag">💡 Floodlights</span>}
            {range.short_game_area && <span className="meta-tag">⛳ Short Game</span>}
          </div>

          <div className="hero-actions" style={{ marginTop: "2rem", justifyContent: "flex-start" }}>
            <span className="button" style={{ pointerEvents: "none" }}>
              {range.price_100_balls != null ? `£${range.price_100_balls.toFixed(2)} / 100 balls` : "Price Not Listed"}
            </span>
            {range.website ? (
              <a href={range.website} target="_blank" rel="noopener noreferrer" className="button secondary">
                Visit Website
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className="stack-sm animate-in" style={{ animationDelay: "0.1s" }}>
        <h2>Location</h2>
        <div className="map-frame">
          <DirectoryMap ranges={[range]} height={400} />
        </div>
      </section>

      <section className="stack-sm animate-in" style={{ animationDelay: "0.2s" }}>
        <div className="section-row">
          <h2>Nearby in {range.city}</h2>
          <Link href="/ranges">Browse all ranges →</Link>
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
