import {
  containsWords,
  filterPubs,
  normalise,
  type DiscoveryFilters,
} from "./discovery";
import type { Pub } from "../types/pub";

export type SearchSuggestion = {
  id: string;
  value: string;
  kind: "Drink" | "Brewery" | "Style" | "Venue";
  detail: string;
  venues: number;
};

export function getSearchSuggestions(
  pubs: Pub[],
  field: "drink" | "location",
  query: string,
  filters: DiscoveryFilters = {},
): SearchSuggestion[] {
  if (normalise(query).length < 2) return [];
  const entries = new Map<
    string,
    SearchSuggestion & { venueIds: Set<number> }
  >();
  const candidates = filterPubs(pubs, filters);
  const add = (
    value: string | null | undefined,
    kind: SearchSuggestion["kind"],
    detail: string,
    pub: Pub,
  ) => {
    if (!value?.trim() || !containsWords(`${value} ${detail}`, query)) return;
    const id = `${kind}:${normalise(value)}`;
    const existing = entries.get(id);
    if (existing) {
      existing.venueIds.add(pub.id);
      return;
    }
    entries.set(id, {
      id,
      value,
      kind,
      detail,
      venues: 0,
      venueIds: new Set([pub.id]),
    });
  };
  for (const pub of candidates) {
    add(pub.name, "Venue", pub.description, pub);
    if (field === "location") continue;
    for (const drink of pub.drinks || []) {
      if (
        filters.type &&
        filters.type !== "All drinks" &&
        normalise(drink.type || "") !== normalise(filters.type)
      )
        continue;
      add(
        drink.name,
        "Drink",
        [drink.brewery, drink.style || drink.type].filter(Boolean).join(" · "),
        pub,
      );
      add(drink.brewery, "Brewery", "", pub);
      add(drink.style, "Style", "", pub);
    }
  }
  const priorities = { Drink: 0, Brewery: 1, Style: 2, Venue: 3 };
  return [...entries.values()]
    .sort(
      (a, b) =>
        Number(normalise(b.value).startsWith(normalise(query))) -
          Number(normalise(a.value).startsWith(normalise(query))) ||
        priorities[a.kind] - priorities[b.kind] ||
        a.value.localeCompare(b.value),
    )
    .slice(0, 8)
    .map(({ venueIds, ...entry }) => ({ ...entry, venues: venueIds.size }));
}
