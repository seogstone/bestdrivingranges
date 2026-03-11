import type { Metadata } from "next";
import { FilterPanel } from "@/components/filter-panel";
import { RangeCard } from "@/components/range-card";
import { getCityRanges } from "@/lib/data/ranges";
import { citySlugToName } from "@/lib/utils/city";
import { parseRangeFilters } from "@/lib/utils/filters";
import { toURLSearchParams, type NextSearchParams } from "@/lib/utils/search-params";

interface CityPageProps {
  params: Promise<{ city: string }>;
  searchParams: NextSearchParams;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  const cityName = citySlugToName(city);

  return {
    title: `Driving ranges in ${cityName}`,
    description: `Browse golf driving ranges and indoor simulators in ${cityName}. Compare facilities and prices.`,
    alternates: {
      canonical: `/city/${city}`,
    },
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  const [{ city }, paramsAsUrl] = await Promise.all([params, toURLSearchParams(searchParams)]);
  const filters = parseRangeFilters(paramsAsUrl);
  const response = await getCityRanges(city, filters);

  return (
    <section className="stack-lg animate-in">
      <header className="hero" style={{ padding: "3.5rem 2rem", textAlign: "center" }}>
        <span className="eyebrow">City Guide</span>
        <h1>Driving Ranges in {response.city}</h1>
        <p className="text-muted" style={{ maxWidth: "600px", margin: "1rem auto 0" }}>
          Explore the best local golf practice searches, indoor simulators, and driving ranges in {response.city}.
        </p>
      </header>

      <div className="animate-in" style={{ animationDelay: "0.1s" }}>
        <FilterPanel initialFilters={{ ...filters, city: response.city }} actionPath={`/city/${city}`} />
      </div>

      <div className="animate-in" style={{ animationDelay: "0.2s" }}>
        {response.ranges.length === 0 ? (
          <p className="text-muted">No published ranges available in this city yet.</p>
        ) : (
          <div className="results-grid">
            {response.ranges.map((range) => (
              <RangeCard key={range.id} range={range} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
