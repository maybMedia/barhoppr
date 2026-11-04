"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import useSWR from "swr";
import {
  Beer,
  ChevronRight,
  Compass,
  Expand,
  Loader2,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import { createPubIcon } from "@/components/map/customMarkerIcon";
import { VenueDetail } from "@/components/venue-detail";
import { Button } from "@/components/ui/button";
import {
  fetchJson,
  filterPubs,
  getLocation,
  type Coordinates,
} from "@/lib/discovery";
import type { Pub } from "@/types/pub";

type ViewRequest = { key: number; point?: Coordinates };

function MapController({
  pubs,
  selected,
  request,
}: {
  pubs: Pub[];
  selected?: Pub;
  request: ViewRequest;
}) {
  const map = useMap();
  const initialFit = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);
  useEffect(() => {
    if (pubs.length && !initialFit.current) {
      map.fitBounds(
        pubs.map((pub) => [pub.lat, pub.long] as [number, number]),
        { padding: [55, 55], maxZoom: 14, animate: false },
      );
      initialFit.current = true;
    }
  }, [map, pubs]);
  useEffect(() => {
    if (selected)
      map.flyTo([selected.lat, selected.long], Math.max(map.getZoom(), 15), {
        duration: 0.7,
        animate: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
  }, [map, selected]);
  useEffect(() => {
    if (!request.key) return;
    const animate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (request.point)
      map.flyTo([request.point.lat, request.point.lng], 13, {
        animate,
        duration: 0.7,
      });
    else if (pubs.length)
      map.fitBounds(
        pubs.map((pub) => [pub.lat, pub.long] as [number, number]),
        { padding: [55, 55], maxZoom: 14, animate },
      );
  }, [map, request, pubs]);
  return null;
}

export default function Map() {
  const { data, error, isLoading, mutate } = useSWR<Pub[]>(
    "/api/pubs",
    fetchJson,
    { shouldRetryOnError: false },
  );
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState("");
  const [request, setRequest] = useState<ViewRequest>({ key: 0 });
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [tileError, setTileError] = useState(false);
  const [tileAttempt, setTileAttempt] = useState(0);
  const sidebar = useRef<HTMLElement>(null);
  const pubs = useMemo(
    () =>
      filterPubs(
        (data || []).filter(
          (pub) => Number.isFinite(pub.lat) && Number.isFinite(pub.long),
        ),
        { query },
      ),
    [data, query],
  );
  const selected = data?.find((pub) => String(pub.id) === params.get("pub"));
  const selectedIcon = useMemo(() => createPubIcon(true), []);
  const icon = useMemo(() => createPubIcon(), []);
  const select = (pub?: Pub) => {
    router.replace(pub ? `/map?pub=${pub.id}` : "/map", { scroll: false });
    sidebar.current?.scrollTo({ top: 0 });
  };
  const locate = async () => {
    setLocating(true);
    setLocationError("");
    try {
      setRequest({ key: Date.now(), point: await getLocation() });
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : "Location is unavailable.",
      );
    } finally {
      setLocating(false);
    }
  };
  if (isLoading)
    return (
      <div className="map-layout">
        <div className="skeleton h-full grid place-items-center">
          <span className="flex gap-3 items-center text-sm">
            <Loader2 size={20} className="animate-spin" />
            Finding your next local…
          </span>
        </div>
        <div className="p-6 space-y-5 hidden md:block">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-20" />
          <div className="skeleton h-20" />
        </div>
      </div>
    );
  if (error)
    return (
      <div className="empty-state mb-12">
        <Beer size={42} />
        <h2>A little hiccup at the tap.</h2>
        <p>
          We couldn’t load the map’s venues. Give it another try in a moment.
        </p>
        <Button onClick={() => mutate()}>
          <RotateCcw size={15} />
          Try again
        </Button>
      </div>
    );
  return (
    <>
      <div className="map-layout">
        <div
          className="map-canvas"
          role="region"
          aria-label="Interactive map of venues"
        >
          <MapContainer
            center={[-33.865, 151.209]}
            zoom={12}
            scrollWheelZoom={false}
            zoomControl={true}
          >
            <TileLayer
              key={tileAttempt}
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
              eventHandlers={{
                tileerror: () => setTileError(true),
                tileload: () => setTileError(false),
              }}
            />
            <MapController pubs={pubs} selected={selected} request={request} />
            <MarkerClusterGroup
              chunkedLoading
              showCoverageOnHover={false}
              maxClusterRadius={45}
              iconCreateFunction={(cluster: { getChildCount: () => number }) =>
                L.divIcon({
                  className: "map-cluster",
                  html: `<span>${cluster.getChildCount()}</span>`,
                  iconSize: [50, 50],
                })
              }
            >
              {pubs.map((pub) => (
                <Marker
                  key={pub.id}
                  position={[pub.lat, pub.long]}
                  icon={selected?.id === pub.id ? selectedIcon : icon}
                  title={pub.name}
                  alt={pub.name}
                  eventHandlers={{ click: () => select(pub) }}
                />
              ))}
            </MarkerClusterGroup>
          </MapContainer>
          {tileError && (
            <div className="tile-error" role="status">
              <p>
                The map background couldn’t load. You can still browse venues
                and get directions.
              </p>
              <button
                onClick={() => {
                  setTileError(false);
                  setTileAttempt((attempt) => attempt + 1);
                }}
              >
                <RotateCcw size={12} />
                Retry map
              </button>
            </div>
          )}
          <div className="map-controls">
            <button
              onClick={locate}
              disabled={locating}
              aria-label="Centre map on my location"
              title="Find me"
            >
              {locating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LocateFixed size={18} />
              )}
            </button>
            <button
              onClick={() => {
                setQuery("");
                select();
                setRequest({ key: Date.now() });
              }}
              aria-label="Fit all venues on the map"
              title="Show all venues"
            >
              <Expand size={18} />
            </button>
          </div>
          <div className="map-hint">
            <span>
              <MapPin size={13} />
              Pick a golden pin. Find a good time.
            </span>
          </div>
        </div>
        <aside
          className="map-sidebar"
          ref={sidebar}
          aria-label="Venue list and details"
        >
          {selected ? (
            <VenueDetail
              key={selected.id}
              pub={selected}
              onBack={() => select()}
            />
          ) : (
            <>
              <div className="sidebar-top">
                <span className="eyebrow mb-2">
                  <Compass size={12} />
                  Your next good find
                </span>
                <h2>Pull up a stool.</h2>
                <p>
                  {pubs.length} {pubs.length === 1 ? "venue" : "venues"} to
                  explore. Pick one for the good stuff.
                </p>
                <label className="sr-only" htmlFor="map-search">
                  Filter venues and drinks
                </label>
                <div className="input-wrap mt-4">
                  <Search size={15} />
                  <input
                    id="map-search"
                    placeholder="Find a venue or drink…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    maxLength={120}
                  />
                </div>
              </div>
              {pubs.map((pub) => (
                <button
                  key={pub.id}
                  className="venue-list-button"
                  onClick={() => select(pub)}
                >
                  <span className="venue-list-icon">
                    <Beer size={22} />
                  </span>
                  <span>
                    <strong>{pub.name}</strong>
                    <small>
                      {pub.drinks?.length || 0} drinks listed · Take a look
                    </small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
              {!pubs.length && (
                <div className="p-6 detail-empty">
                  <Compass size={28} className="mb-3 text-tertiary" />
                  <p>
                    {data?.length
                      ? "No matches this round. Try a different venue or drink."
                      : "The first locals are on their way. Check back soon."}
                  </p>
                  {query && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setQuery("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
      {locationError && (
        <p className="status-message error-message" role="alert">
          {locationError}
        </p>
      )}
      <div className="flex justify-between gap-4 flex-wrap text-[10px] text-muted-foreground mt-4">
        <span>
          Explore at your own pace. Scroll outside the map to move the page.
        </span>
        <span>Drink availability may change. Check with the venue.</span>
      </div>
    </>
  );
}
