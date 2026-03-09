import Link from "next/link";
import { FilterPanel } from "@/components/filter-panel";
import { DirectoryMap } from "@/components/maps/directory-map";
import { RangeCard } from "@/components/range-card";
import { listRanges } from "@/lib/data/ranges";
import { parseRangeFilters } from "@/lib/utils/filters";
import { toURLSearchParams, type NextSearchParams } from "@/lib/utils/search-params";

interface RangesPageProps {
  searchParams: NextSearchParams;
}

export default async function RangesPage({ searchParams }: RangesPageProps) {
  const params = await toURLSearchParams(searchParams);
  const filters = parseRangeFilters(params);
  const view = params.get("view") ?? "list";

  const response = await listRanges(filters);

  return (
    <section className="stack-lg">
      <header className="section-row">
        <div>
          <h1>All Driving Ranges</h1>
          <p className="text-muted">{response.total} published listings</p>
        </div>
        <div className="filter-inline">
          <Link href={`/ranges?${params.toString()}`}>List view</Link>
          <Link href={`/ranges?${new URLSearchParams({ ...Object.fromEntries(params), view: "map" }).toString()}`}>
            Map view
          </Link>
        </div>
      </header>

      <FilterPanel initialFilters={filters} actionPath="/ranges" />

      {view === "map" ? (
        <DirectoryMap ranges={response.ranges} />
      ) : response.ranges.length === 0 ? (
        <p className="text-muted">No listings match these filters.</p>
      ) : (
        <div className="results-grid">
          {response.ranges.map((range) => (
            <RangeCard key={range.id} range={range} />
          ))}
        </div>
      )}
    </section>
  );
}
