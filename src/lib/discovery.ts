import type { Pub } from "@/types/pub";

export type Coordinates = { lat: number; lng: number };
export type DiscoveryFilters = {
  query?: string;
  location?: string;
  type?: string;
  origin?: Coordinates | null;
  radius?: number;
  sort?: "name" | "distance" | "drinks";
};

export function distanceKm(a: Coordinates, b: Coordinates) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) *
      Math.cos(radians(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return (
    6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(Math.max(0, 1 - value)))
  );
}

export function normalise(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
export function containsWords(value: string, query: string) {
  const text = normalise(value);
  return normalise(query)
    .split(/\s+/)
    .every((word) => text.includes(word));
}

export function filterPubs(pubs: Pub[], filters: DiscoveryFilters) {
  return pubs
    .filter((pub) => {
      const drinks = pub.drinks || [];
      const matchingDrinks =
        filters.type && filters.type !== "All drinks"
          ? drinks.filter(
              (drink) =>
                normalise(drink.type || "") === normalise(filters.type!),
            )
          : drinks;
      if (
        filters.type &&
        filters.type !== "All drinks" &&
        !matchingDrinks.length
      )
        return false;
      if (
        filters.query &&
        !containsWords(`${pub.name} ${pub.description}`, filters.query) &&
        !matchingDrinks.some((drink) =>
          containsWords(
            [drink.name, drink.brewery, drink.style, drink.type]
              .filter(Boolean)
              .join(" "),
            filters.query!,
          ),
        )
      )
        return false;
      if (
        filters.location &&
        !containsWords(`${pub.name} ${pub.description}`, filters.location)
      )
        return false;
      if (
        filters.origin &&
        filters.radius &&
        distanceKm(filters.origin, { lat: pub.lat, lng: pub.long }) >
          filters.radius
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sort === "distance" && filters.origin)
        return (
          distanceKm(filters.origin, { lat: a.lat, lng: a.long }) -
          distanceKm(filters.origin, { lat: b.lat, lng: b.long })
        );
      if (filters.sort === "drinks")
        return (
          (b.drinks?.length || 0) - (a.drinks?.length || 0) ||
          a.name.localeCompare(b.name)
        );
      return a.name.localeCompare(b.name);
    });
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(
      "We couldn’t load the latest information. Please try again.",
    );
  return response.json();
}

export function getLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      return reject(
        new Error(
          "Your browser doesn’t support location. Try searching a venue or area instead.",
        ),
      );
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (error) =>
        reject(
          new Error(
            error.code === 1
              ? "Location permission was declined. You can still search by venue or area."
              : "We couldn’t find your location. Please try again or search a venue.",
          ),
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
}
