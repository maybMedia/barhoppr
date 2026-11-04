"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
  loading: () => (
    <div className="skeleton h-[660px]" aria-label="Loading interactive map" />
  ),
});
export default function MapClient() {
  return <Map />;
}
