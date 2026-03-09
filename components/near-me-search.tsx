"use client";

import { useState } from "react";
import { RangeCard } from "@/components/range-card";
import type { Range } from "@/types/range";

interface NearMeState {
  loading: boolean;
  error: string | null;
  ranges: Range[];
}

export function NearMeSearch() {
  const [state, setState] = useState<NearMeState>({
    loading: false,
    error: null,
    ranges: [],
  });

  async function runSearch() {
    if (!navigator.geolocation) {
      setState({ loading: false, error: "Geolocation is not supported in this browser.", ranges: [] });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const params = new URLSearchParams({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString(),
          radiusKm: "30",
          sort: "distance",
          pageSize: "20",
        });

        const response = await fetch(`/api/ranges?${params.toString()}`);
        if (!response.ok) {
          setState({ loading: false, error: "Could not load nearby ranges.", ranges: [] });
          return;
        }

        const payload = (await response.json()) as { ranges: Range[] };
        setState({ loading: false, error: null, ranges: payload.ranges ?? [] });
      },
      () => {
        setState({ loading: false, error: "Location permission was denied.", ranges: [] });
      },
    );
  }

  return (
    <section className="stack-md">
      <div className="card stack-sm">
        <h2>Find ranges near your current location</h2>
        <p className="text-muted">
          We use your browser location only for this search request.
        </p>
        <button onClick={runSearch} disabled={state.loading}>
          {state.loading ? "Searching..." : "Find nearby ranges"}
        </button>
        {state.error ? <p className="error-text">{state.error}</p> : null}
      </div>

      {state.ranges.length > 0 ? (
        <div className="results-grid">
          {state.ranges.map((range) => (
            <RangeCard key={range.id} range={range} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
