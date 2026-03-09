import type { RangeFilters } from "@/types/range";

interface FilterPanelProps {
  initialFilters: RangeFilters;
  actionPath: string;
}

function boolChecked(value: boolean | undefined): boolean {
  return value === true;
}

export function FilterPanel({ initialFilters, actionPath }: FilterPanelProps) {
  return (
    <form className="card filter-panel" method="get" action={actionPath}>
      <h2>Filters</h2>
      <label>
        City
        <input name="city" defaultValue={initialFilters.city ?? ""} placeholder="London" />
      </label>

      <label>
        Facility Type
        <select name="facilityType" defaultValue={initialFilters.facilityType ?? ""}>
          <option value="">Any</option>
          <option value="outdoor">Outdoor</option>
          <option value="indoor">Indoor</option>
          <option value="both">Both</option>
        </select>
      </label>

      <label>
        Simulator Brand
        <input
          name="simulatorBrand"
          defaultValue={initialFilters.simulatorBrand ?? ""}
          placeholder="Trackman"
        />
      </label>

      <label>
        Price Bucket
        <select name="priceBucket" defaultValue={initialFilters.priceBucket ?? ""}>
          <option value="">Any</option>
          <option value="budget">Budget</option>
          <option value="mid">Mid</option>
          <option value="premium">Premium</option>
        </select>
      </label>

      <label>
        Sort
        <select name="sort" defaultValue={initialFilters.sort ?? "name_asc"}>
          <option value="name_asc">Name A-Z</option>
          <option value="price_asc">Price low-high</option>
          <option value="price_desc">Price high-low</option>
          <option value="distance">Distance</option>
        </select>
      </label>

      <div className="filter-grid">
        <label className="checkbox">
          <input
            name="coveredBays"
            value="true"
            type="checkbox"
            defaultChecked={boolChecked(initialFilters.coveredBays)}
          />
          Covered bays
        </label>

        <label className="checkbox">
          <input
            name="floodlights"
            value="true"
            type="checkbox"
            defaultChecked={boolChecked(initialFilters.floodlights)}
          />
          Floodlights
        </label>

        <label className="checkbox">
          <input
            name="shortGameArea"
            value="true"
            type="checkbox"
            defaultChecked={boolChecked(initialFilters.shortGameArea)}
          />
          Short game area
        </label>
      </div>

      <div className="filter-inline">
        <label>
          Lat
          <input name="lat" type="number" step="any" defaultValue={initialFilters.lat ?? ""} />
        </label>

        <label>
          Lng
          <input name="lng" type="number" step="any" defaultValue={initialFilters.lng ?? ""} />
        </label>

        <label>
          Radius (km)
          <input name="radiusKm" type="number" step="1" defaultValue={initialFilters.radiusKm ?? ""} />
        </label>
      </div>

      <button type="submit">Apply Filters</button>
    </form>
  );
}
