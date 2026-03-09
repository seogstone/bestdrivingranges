import { DirectoryMap } from "@/components/maps/directory-map";
import { listRanges } from "@/lib/data/ranges";

export default async function MapPage() {
  const response = await listRanges({ page: 1, pageSize: 500, sort: "name_asc" });

  return (
    <section className="stack-md">
      <header>
        <h1>Range Map</h1>
        <p className="text-muted">Map-first browsing across UK driving ranges and simulators.</p>
      </header>
      <DirectoryMap ranges={response.ranges} height={620} />
    </section>
  );
}
