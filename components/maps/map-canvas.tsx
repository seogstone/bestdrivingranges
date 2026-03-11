"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { Range } from "@/types/range";

import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapCanvasProps {
  ranges: Range[];
  height?: number;
}

export function MapCanvas({ ranges, height = 420 }: MapCanvasProps) {
  const center = useMemo<[number, number]>(() => {
    if (ranges.length === 0) {
      return [52.3555, -1.1743];
    }

    const avgLat = ranges.reduce((sum, range) => sum + range.latitude, 0) / ranges.length;
    const avgLng = ranges.reduce((sum, range) => sum + range.longitude, 0) / ranges.length;

    return [avgLat, avgLng];
  }, [ranges]);

  return (
    <MapContainer center={center} zoom={6} scrollWheelZoom style={{ height }} className="map-frame">
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {ranges.map((range) => (
        <Marker key={range.id} position={[range.latitude, range.longitude]} icon={markerIcon}>
          <Popup>
            <strong>{range.name}</strong>
            <br />
            {range.city}
            <br />
            <Link href={`/range/${range.slug}`}>Open listing</Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
