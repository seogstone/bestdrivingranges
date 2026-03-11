import type { Metadata } from "next";
import Link from "next/link";
import { RangeCard } from "@/components/range-card";
import { listRanges } from "@/lib/data/ranges";
import { parseRangeFilters } from "@/lib/utils/filters";
import { toURLSearchParams, type NextSearchParams } from "@/lib/utils/search-params";
import { cityToSlug } from "@/lib/utils/city";

export const metadata: Metadata = {
  title: "UK Golf Driving Ranges - Britain's Practice Directory",
  description:
    "Find the perfect golf practice facility anywhere in the UK. Discover driving ranges across England, Scotland, Wales, and Northern Ireland.",
  alternates: {
    canonical: "/uk",
  },
};

interface UKIndexPageProps {
  searchParams: NextSearchParams;
}

export default async function UKIndexPage({ searchParams }: UKIndexPageProps) {
  const params = await toURLSearchParams(searchParams);
  const filters = parseRangeFilters(params);
  
  // Hardcode region clusters for programmatic SEO linking (like the competitor)
  const regions = {
    "London & South East": ["London", "Brighton", "Reading", "Milton Keynes"],
    "Midlands": ["Birmingham", "Nottingham", "Leicester", "Coventry"],
    "North West & Yorkshire": ["Manchester", "Liverpool", "Leeds", "Sheffield"],
    "Scotland & Wales": ["Edinburgh", "Glasgow", "Cardiff", "Swansea"],
  };

  const response = await listRanges(filters);

  return (
    <section className="stack-lg animate-in">
      <header className="hero" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <span className="eyebrow">🇬🇧 UK Golf Ranges</span>
        <h1 style={{ marginTop: "0.5rem" }}>Find A Golf Range Near You</h1>
        <p className="text-muted" style={{ maxWidth: "700px", margin: "1rem auto 0" }}>
          Discover the best golf driving ranges and indoor simulators across the UK. Practice your swing at top-quality facilities near you.
        </p>
      </header>

      <section className="stack-md animate-in" style={{ animationDelay: "0.1s" }}>
        <h2>Explore By Region</h2>
        <div className="grid" style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          {Object.entries(regions).map(([region, cities]) => (
            <div key={region} className="card">
              <h3>{region}</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0 0 0", display: "grid", gap: "0.5rem" }}>
                {cities.map(city => (
                  <li key={city}>
                    <Link href={`/city/${cityToSlug(city)}`} className="text-muted" style={{ display: "block" }}>
                      &rarr; Ranges in {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="animate-in" style={{ animationDelay: "0.2s" }}>
        <div className="section-row">
          <h2>Latest UK Ranges</h2>
          <Link href="/ranges">View all directories →</Link>
        </div>
        {response.ranges.length === 0 ? (
          <p className="text-muted">No UK listings found.</p>
        ) : (
          <div className="results-grid">
            {response.ranges.slice(0, 8).map((range) => (
              <RangeCard key={range.id} range={range} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
