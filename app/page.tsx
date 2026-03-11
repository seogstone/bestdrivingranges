import Link from "next/link";
import { RangeCard } from "@/components/range-card";
import { cityToSlug } from "@/lib/utils/city";
import { getFeaturedRanges, getPopularCities } from "@/lib/data/ranges";

export default async function HomePage() {
  const [featuredRanges, popularCities] = await Promise.all([
    getFeaturedRanges(6),
    getPopularCities(12),
  ]);

  return (
    <section className="stack-lg">
      <div className="hero animate-in">
        <span className="eyebrow">The UK&apos;s Premium Directory</span>
        <h1>
          Find the <span className="text-gradient">best driving ranges</span> and indoor simulators near you.
        </h1>
        <p className="text-muted">
          Browse top-tier UK facilities, compare prices, filter by trackman, and discover hidden gems in your area.
        </p>
        <div className="hero-actions">
          <Link href="/ranges" className="button">
            Browse all ranges
          </Link>
          <Link href="/near-me" className="button secondary">
            Use my location
          </Link>
        </div>
      </div>

      <section className="stack-md animate-in" style={{ animationDelay: "0.1s" }}>
        <h2>Popular cities</h2>
        {popularCities.length === 0 ? (
          <p className="text-muted">No city data loaded yet. Import your CSV seed to populate this section.</p>
        ) : (
          <div className="city-grid">
            {popularCities.map((city) => (
              <Link key={city} href={`/city/${cityToSlug(city)}`} className="city-card">
                <strong>{city}</strong>
                <span>Explore listings</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="stack-md animate-in" style={{ animationDelay: "0.2s" }}>
        <div className="section-row">
          <h2>Featured ranges</h2>
          <Link href="/ranges">View all →</Link>
        </div>
        {featuredRanges.length === 0 ? (
          <p className="text-muted">No published ranges yet.</p>
        ) : (
          <div className="results-grid">
            {featuredRanges.map((range) => (
              <RangeCard key={range.id} range={range} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
