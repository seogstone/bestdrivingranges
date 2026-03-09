"use client";

import dynamic from "next/dynamic";
import type { Range } from "@/types/range";

const DynamicMapCanvas = dynamic(
  () => import("@/components/maps/map-canvas").then((mod) => mod.MapCanvas),
  { ssr: false },
);

interface DirectoryMapProps {
  ranges: Range[];
  height?: number;
}

export function DirectoryMap({ ranges, height }: DirectoryMapProps) {
  if (ranges.length === 0) {
    return <div className="card">No map pins available for this filter set.</div>;
  }

  return <DynamicMapCanvas ranges={ranges} height={height} />;
}
