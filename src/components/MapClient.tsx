"use client"; // important — makes this a Client Component

import dynamic from "next/dynamic";

// Leaflet map component (dynamic import not needed inside a client component)
const Map = dynamic(() => import("@/components/map"), { ssr: false });

export default function MapClient() {
  return <Map />;
}
