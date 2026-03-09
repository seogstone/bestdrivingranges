import Link from "next/link";
import { cityToSlug } from "@/lib/utils/city";
import type { Range } from "@/types/range";

interface RangeCardProps {
  range: Range;
}

export function RangeCard({ range }: RangeCardProps) {
  return (
    <article className="card range-card">
      <div className="range-card-head">
        <h3>
          <Link href={`/range/${range.slug}`}>{range.name}</Link>
        </h3>
        <span className="pill">{range.facility_type}</span>
      </div>
      <p className="text-muted">{range.address}</p>
      <p className="text-muted">
        <Link href={`/city/${cityToSlug(range.city)}`}>{range.city}</Link> · {range.postcode}
      </p>
      <div className="range-card-meta">
        <span>Covered bays: {range.covered_bays ? "Yes" : "No"}</span>
        <span>Floodlights: {range.floodlights ? "Yes" : "No"}</span>
        <span>Short game area: {range.short_game_area ? "Yes" : "No"}</span>
      </div>
      <div className="range-card-footer">
        <span>
          Price (100 balls): {range.price_100_balls != null ? `£${range.price_100_balls.toFixed(2)}` : "Not listed"}
        </span>
        {range.distance_km != null ? <span>{range.distance_km.toFixed(1)} km away</span> : null}
      </div>
    </article>
  );
}
