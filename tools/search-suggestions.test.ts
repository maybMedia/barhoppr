import assert from "node:assert/strict";
import { test } from "node:test";
import { getSearchSuggestions } from "../src/lib/search-suggestions";
import { filterPubs } from "../src/lib/discovery";
import type { Pub } from "../src/types/pub";

const pubs: Pub[] = [
  {
    id: 1,
    name: "Café Local",
    description: "A Surry Hills pub",
    lat: -33.88,
    long: 151.21,
    drinks: [
      {
        id: 1,
        name: "Golden Hour",
        brewery: "Neighbourhood Brewing",
        style: "Pale Ale",
        type: "Beer",
      },
      { id: 2, name: "Orchard Gold", brewery: "Apple House", type: "Cider" },
    ],
  },
  {
    id: 2,
    name: "Sunday Local",
    description: "A Manly local",
    lat: -33.8,
    long: 151.28,
    drinks: [
      {
        id: 1,
        name: "Golden Hour",
        brewery: "Neighbourhood Brewing",
        style: "Pale Ale",
        type: "Beer",
      },
    ],
  },
];

test("drink suggestions find names, producers and styles and deduplicate venue listings", () => {
  const gold = getSearchSuggestions(pubs, "drink", "gold");
  assert.equal(gold.find((entry) => entry.value === "Golden Hour")?.venues, 2);
  assert.equal(gold.filter((entry) => entry.value === "Golden Hour").length, 1);
  for (const query of ["gold", "neighbourhood", "pale", "cafe"]) {
    const suggestions = getSearchSuggestions(pubs, "drink", query);
    assert.ok(suggestions.length);
    for (const suggestion of suggestions)
      assert.ok(filterPubs(pubs, { query: suggestion.value }).length);
  }
  assert.ok(
    getSearchSuggestions(pubs, "drink", "neighbourhood").some(
      (entry) => entry.kind === "Brewery",
    ),
  );
  assert.ok(
    getSearchSuggestions(pubs, "drink", "pale").some(
      (entry) => entry.kind === "Style",
    ),
  );
  assert.deepEqual(getSearchSuggestions(pubs, "drink", "g"), []);
  assert.deepEqual(getSearchSuggestions(pubs, "drink", "missing"), []);
});

test("location suggestions match area descriptions and accent-insensitive venue names", () => {
  for (const query of ["surry hills", "cafe"]) {
    const suggestions = getSearchSuggestions(pubs, "location", query);
    assert.deepEqual(
      suggestions.map((entry) => entry.value),
      ["Café Local"],
    );
    assert.equal(suggestions[0].kind, "Venue");
    assert.equal(filterPubs(pubs, { location: suggestions[0].value })[0].id, 1);
  }
  assert.deepEqual(getSearchSuggestions(pubs, "location", "Golden"), []);
});

test("suggestions respect the other field, nearby radius and the same drink’s type", () => {
  assert.deepEqual(
    getSearchSuggestions(pubs, "drink", "Orchard", { type: "Beer" }),
    [],
  );
  assert.deepEqual(
    getSearchSuggestions(pubs, "drink", "Golden", { location: "missing" }),
    [],
  );
  assert.equal(
    getSearchSuggestions(pubs, "drink", "Golden", { location: "Manly" })[0]
      .venues,
    1,
  );
  assert.deepEqual(
    getSearchSuggestions(pubs, "location", "local", { query: "Orchard" }).map(
      (entry) => entry.value,
    ),
    ["Café Local"],
  );
  assert.deepEqual(
    getSearchSuggestions(pubs, "location", "local", {
      origin: { lat: -33.88, lng: 151.21 },
      radius: 1,
    }).map((entry) => entry.value),
    ["Café Local"],
  );
});
