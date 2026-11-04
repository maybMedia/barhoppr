"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import {
  ArrowRight,
  Beer,
  Compass,
  Loader2,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VenueCard } from "@/components/venue-card";
import { SearchAutocomplete } from "@/components/search-autocomplete";
import { getSearchSuggestions } from "@/lib/search-suggestions";
import {
  fetchJson,
  filterPubs,
  getLocation,
  type Coordinates,
} from "@/lib/discovery";
import type { Pub } from "@/types/pub";

export function SearchExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const [type, setType] = useState("All drinks");
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [radius, setRadius] = useState(25);
  const [sort, setSort] = useState<"name" | "distance" | "drinks">("name");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const { data, error, isLoading, mutate } = useSWR<Pub[]>(
    "/api/pubs",
    fetchJson,
    { shouldRetryOnError: false },
  );
  useEffect(() => {
    setQuery(params.get("q") || "");
    setLocation(params.get("location") || "");
  }, [params]);
  const results = useMemo(
    () =>
      filterPubs(data || [], {
        query: params.get("q") || "",
        location: params.get("location") || "",
        type,
        origin,
        radius,
        sort,
      }),
    [data, params, type, origin, radius, sort],
  );
  const types = useMemo(
    () => [
      "All drinks",
      ...Array.from(
        new Set(
          (data || []).flatMap((pub) =>
            (pub.drinks || [])
              .map((drink) => drink.type)
              .filter((type): type is string => Boolean(type)),
          ),
        ),
      ).sort(),
    ],
    [data],
  );
  const drinkSuggestions = useMemo(
    () =>
      getSearchSuggestions(data || [], "drink", query, {
        location,
        type,
        origin,
        radius,
      }),
    [data, query, location, type, origin, radius],
  );
  const locationSuggestions = useMemo(
    () =>
      getSearchSuggestions(data || [], "location", location, {
        query,
        type,
        origin,
        radius,
      }),
    [data, query, location, type, origin, radius],
  );
  const locate = async () => {
    setLocating(true);
    setLocationError("");
    try {
      setOrigin(await getLocation());
      setSort("distance");
      setLocation("");
      const next = new URLSearchParams(params);
      next.delete("location");
      router.replace(`/search?${next}`, { scroll: false });
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : "Location is unavailable.",
      );
    } finally {
      setLocating(false);
    }
  };
  const reset = () => {
    setQuery("");
    setLocation("");
    setType("All drinks");
    setOrigin(null);
    setLocationError("");
    setSort("name");
    router.replace("/search", { scroll: false });
  };
  return (
    <>
      <form
        className="search-panel"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const next = new URLSearchParams();
          if (query.trim()) next.set("q", query.trim());
          if (location.trim()) next.set("location", location.trim());
          router.replace(`/search${next.size ? `?${next}` : ""}`, {
            scroll: false,
          });
        }}
      >
        <div className="search-fields">
          <SearchAutocomplete
            id="drink-query"
            label="YOUR NEXT ROUND"
            icon={Beer}
            value={query}
            onChange={setQuery}
            placeholder="Drink, brewery, style, or venue…"
            suggestions={drinkSuggestions}
            loading={isLoading}
            unavailable={Boolean(error)}
          />
          <SearchAutocomplete
            id="location-query"
            label="YOUR NECK OF THE WOODS"
            icon={MapPin}
            value={location}
            onChange={setLocation}
            placeholder="Venue name or area…"
            suggestions={locationSuggestions}
            loading={isLoading}
            unavailable={Boolean(error)}
          />
          <Button className="button-large button-dark" type="submit">
            <Search size={17} />
            Find my round
            <ArrowRight size={17} />
          </Button>
        </div>
        <div className="search-options">
          <div className="filter-chips" aria-label="Filter by drink type">
            {types.map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setType(value)}
                aria-pressed={type === value}
                className={`filter-chip ${type === value ? "active" : ""}`}
              >
                {value === "All drinks" && <Beer size={13} />}
                {value}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="near-me"
            onClick={locate}
            disabled={locating}
          >
            {locating ? (
              <Loader2 className="animate-spin" size={15} />
            ) : (
              <LocateFixed size={15} />
            )}
            {origin ? "Refresh my location" : "Use my location"}
          </button>
        </div>
        {origin && (
          <div className="search-options">
            <span className="tag tag-gold">
              <LocateFixed size={12} />
              Near you
              <button
                type="button"
                aria-label="Remove nearby filter"
                onClick={() => {
                  setOrigin(null);
                  setSort("name");
                }}
              >
                <X size={13} />
              </button>
            </span>
            <label className="text-xs flex items-center gap-2">
              Within
              <select
                className="inline-select"
                aria-label="Search radius"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
              >
                {[5, 10, 25, 50, 100].map((value) => (
                  <option key={value} value={value}>
                    {value} km
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {locationError && (
          <p className="status-message error-message" role="alert">
            {locationError}
          </p>
        )}
      </form>
      <div className="result-toolbar">
        <div>
          <h2>
            {isLoading
              ? "Finding the good stuff…"
              : `${results.length} ${results.length === 1 ? "local" : "locals"} to explore`}
          </h2>
          <p>
            {params.get("q")
              ? `Results for “${params.get("q")}”`
              : "Great places. Drinks worth discovering."}
            {params.get("location") ? ` in “${params.get("location")}”` : ""}
          </p>
        </div>
        <label className="sr-only" htmlFor="result-sort">
          Sort results
        </label>
        <select
          id="result-sort"
          className="inline-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
        >
          <option value="name">Name A–Z</option>
          <option value="drinks">Most drinks listed</option>
          <option value="distance" disabled={!origin}>
            Nearest to me
          </option>
        </select>
      </div>
      <div className="result-grid" aria-live="polite" aria-busy={isLoading}>
        {isLoading ? (
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="venue-card" aria-hidden="true">
              <div className="skeleton h-44" />
              <div className="p-6 space-y-4">
                <div className="skeleton h-6 w-3/4" />
                <div className="skeleton h-12" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="empty-state">
            <Beer size={40} />
            <h2>A little hiccup at the tap.</h2>
            <p>
              We couldn’t load the venues right now. Please give it another try.
            </p>
            <Button onClick={() => mutate()}>
              <RotateCcw size={16} />
              Try again
            </Button>
          </div>
        ) : results.length ? (
          results.map((pub) => (
            <VenueCard key={pub.id} pub={pub} origin={origin} />
          ))
        ) : (
          <div className="empty-state">
            <Compass size={42} />
            <h2>No locals in this round.</h2>
            <p>
              Try a different drink or venue, broaden the nearby radius, or
              clear your filters. Area search checks the names and descriptions
              of our listed venues.
            </p>
            <Button onClick={reset}>
              <RotateCcw size={16} />
              Show all venues
            </Button>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground -mt-10 pb-12">
        Drink listings are a guide. Availability can change, so check with the
        venue before making a special trip.
      </p>
    </>
  );
}
