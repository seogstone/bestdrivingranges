import Link from "next/link";
import { cityToSlug } from "@/lib/utils/city";
import type { Range } from "@/types/range";

interface RangeCardProps {
  range: Range;
}

export function RangeCard({ range }: RangeCardProps) {
  return (
    <article className="card range-card">
      <div className="range-card-img-placeholder">
        {/* Placeholder for future specific images, using CSS background for now */}
      </div>
      <div className="range-card-content">
        <div className="range-card-head">
          <h3>
            <Link href={`/range/${range.slug}`}>{range.name}</Link>
          </h3>
          <span className="pill">{range.facility_type}</span>
        </div>
        <p className="text-muted">
          {range.address}, <Link href={`/city/${cityToSlug(range.city)}`}>{range.city}</Link> {range.postcode}
        </p>
        
        <div className="range-card-meta">
          {range.covered_bays && <span className="meta-tag">☔ Covered Bays</span>}
          {range.floodlights && <span className="meta-tag">💡 Floodlights</span>}
          {range.short_game_area && <span className="meta-tag">⛳ Short Game</span>}
        </div>
        
        <div className="range-card-footer">
          <span className="price">
            {range.price_100_balls != null ? `£${range.price_100_balls.toFixed(2)}` : "Price Not Listed"}
          </span>
          {range.distance_km != null ? <span className="distance">{range.distance_km.toFixed(1)} km away</span> : null}
        </div>
      </div>
    </article>
  );
}
