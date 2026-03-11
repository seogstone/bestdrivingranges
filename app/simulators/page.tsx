import type { Metadata } from "next";
import Link from "next/link";
import { FilterPanel } from "@/components/filter-panel";
import { DirectoryMap } from "@/components/maps/directory-map";
import { RangeCard } from "@/components/range-card";
import { listRanges } from "@/lib/data/ranges";
import { parseRangeFilters } from "@/lib/utils/filters";
import { toURLSearchParams, type NextSearchParams } from "@/lib/utils/search-params";

export const metadata: Metadata = {
  title: "Indoor Golf Simulators Directory",
  description:
    "Find premium indoor golf simulation facilities worldwide. TrackMan technology, virtual courses, and year-round practice at the best venues.",
  alternates: {
    canonical: "/simulators",
  },
};

interface SimulatorsPageProps {
  searchParams: NextSearchParams;
}

export default async function SimulatorsPage({ searchParams }: SimulatorsPageProps) {
  const params = await toURLSearchParams(searchParams);
  // Force the facilityType filter to be indoor only for this dedicated route
  const rawFilters = parseRangeFilters(params);
  const filters = { ...rawFilters, facilityType: "indoor" as const };
  const view = params.get("view") ?? "list";

  const response = await listRanges(filters);

  return (
    <section className="stack-lg animate-in">
      <header className="hero" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <span className="eyebrow">Premium Practice</span>
        <h1 style={{ marginTop: "0.5rem" }}>Find An Indoor Golf Simulator Near You</h1>
        <p className="text-muted" style={{ maxWidth: "700px", margin: "1rem auto 0" }}>
          Discover cutting-edge TrackMan technology, virtual golf courses, advanced swing analysis, and year-round practice venues. Compare prices, features, and locations to find your perfect indoor golf experience.
        </p>
        
        <div className="filter-inline" style={{ marginTop: "2rem", justifyContent: "center" }}>
          <Link href={`/simulators?${params.toString()}`} className={`button ${view === 'list' ? '' : 'secondary'}`}>List view</Link>
          <Link href={`/simulators?${new URLSearchParams({ ...Object.fromEntries(params), view: "map" }).toString()}`} className={`button ${view === 'map' ? '' : 'secondary'}`}>
            Map view
          </Link>
        </div>
      </header>

      <div className="animate-in" style={{ animationDelay: "0.1s" }}>
        {/* We hide the facility type filter since this page is hardcoded to indoor */}
        <FilterPanel initialFilters={filters} actionPath="/simulators" />
      </div>

      <div className="animate-in" style={{ animationDelay: "0.2s" }}>
        {view === "map" ? (
          <div className="map-frame">
             <DirectoryMap ranges={response.ranges} />
          </div>
        ) : response.ranges.length === 0 ? (
          <p className="text-muted">No indoor simulators match these filters.</p>
        ) : (
          <div className="results-grid">
            {response.ranges.map((range) => (
              <RangeCard key={range.id} range={range} />
            ))}
          </div>
        )}
      </div>

      {/* SEO Content Block similar to findagolfrange.com */}
      <section className="card stack-md animate-in" style={{ animationDelay: "0.3s", marginTop: "4rem" }}>
        <h2>Why Choose Indoor Golf Simulators?</h2>
        <div className="grid" style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginTop: "1.5rem" }}>
          <div>
            <h3>Year-Round Practice</h3>
            <p className="text-muted">Practice your golf swing any time with climate-controlled indoor facilities. No more weather delays or seasonal restrictions - perfect your game 365 days a year.</p>
          </div>
          <div>
            <h3>Advanced Analytics</h3>
            <p className="text-muted">Get instant feedback on swing speed, ball flight, spin rate, and shot accuracy with professional-grade launch monitor technology including TrackMan and GCQuad systems.</p>
          </div>
          <div>
            <h3>Play World-Famous Courses</h3>
            <p className="text-muted">Experience virtual rounds on legendary courses like Pebble Beach and St. Andrews from your local facility.</p>
          </div>
        </div>
      </section>
    </section>
  );
}
