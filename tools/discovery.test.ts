import assert from "node:assert/strict";
import { test } from "node:test";
import { distanceKm, filterPubs } from "../src/lib/discovery";
import { VisitSchema } from "../src/lib/visit-validation";
import type { Pub } from "../src/types/pub";

const pubs: Pub[] = [
  {
    id: 1,
    name: "Café Local",
    description: "A Surry Hills corner pub",
    lat: -33.8847,
    long: 151.2118,
    drinks: [
      {
        id: 1,
        name: "Hazy Days",
        brewery: "Neighbourhood Brewing",
        style: "Pale Ale",
        type: "Beer",
        abv: 5.2,
      },
    ],
  },
  {
    id: 2,
    name: "Sunday Club",
    description: "A breezy Manly local",
    lat: -33.7973,
    long: 151.2872,
    drinks: [{ id: 2, name: "Orchard", type: "Cider" }],
  },
  {
    id: 3,
    name: "Empty Tap",
    description: "A new Parramatta venue",
    lat: -33.8152,
    long: 151.0035,
  },
];

test("drink, brewery, style, and venue searches ignore case and accents", () => {
  for (const query of ["HAZY", "neighbourhood", "pale ale", "cafe"])
    assert.deepEqual(
      filterPubs(pubs, { query }).map((pub) => pub.id),
      [1],
    );
  assert.deepEqual(filterPubs(pubs, { query: "unknown" }), []);
});

test("drink and location filters combine and empty drink lists are supported", () => {
  assert.deepEqual(
    filterPubs(pubs, {
      query: "hazy",
      location: "surry hills",
      type: "Beer",
    }).map((pub) => pub.id),
    [1],
  );
  assert.deepEqual(filterPubs(pubs, { query: "hazy", location: "Manly" }), []);
  assert.deepEqual(
    filterPubs(pubs, { type: "Cider" }).map((pub) => pub.id),
    [2],
  );
  assert.equal(filterPubs(pubs, {}).length, 3);
});

test("nearby search respects radius and sorts by actual geographic distance", () => {
  const origin = { lat: -33.8847, lng: 151.2118 };
  assert.equal(distanceKm(origin, origin), 0);
  assert.ok(distanceKm(origin, { lat: -33.7973, lng: 151.2872 }) > 10);
  assert.deepEqual(
    filterPubs(pubs, { origin, radius: 5, sort: "distance" }).map(
      (pub) => pub.id,
    ),
    [1],
  );
  assert.deepEqual(
    filterPubs(pubs, { origin, radius: 50, sort: "distance" }).map(
      (pub) => pub.id,
    ),
    [1, 2, 3],
  );
});

test("drink searches match one drink and respect that drink’s type", () => {
  const venue: Pub = {
    id: 9,
    name: "A Local",
    description: "A place to meet",
    lat: 0,
    long: 0,
    drinks: [
      { id: 1, name: "Golden Lager", type: "Beer" },
      { id: 2, name: "Orchard Cider", type: "Cider" },
    ],
  };
  assert.deepEqual(filterPubs([venue], { query: "Golden Orchard" }), []);
  assert.deepEqual(
    filterPubs([venue], { query: "Golden Lager", type: "Cider" }),
    [],
  );
  assert.deepEqual(
    filterPubs([venue], { query: "Orchard", type: "Cider" }).map(
      (pub) => pub.id,
    ),
    [9],
  );
});

test("visits allow optional bounded notes and require an integer rating and valid drink identifiers", () => {
  const visit = {
    name: "A great afternoon",
    description: "Cold beer and good company.",
    rating: 4,
    drinkIds: [1, 1, 2],
  };
  assert.deepEqual(VisitSchema.parse(visit).drinkIds, [1, 2]);
  for (const rating of [0, 6, 3.5, "5", null])
    assert.equal(VisitSchema.safeParse({ ...visit, rating }).success, false);
  for (const description of [undefined, "", " "]) {
    assert.equal(VisitSchema.parse({ ...visit, description }).description, "");
  }
  assert.equal(
    VisitSchema.parse({ ...visit, description: "OK" }).description,
    "OK",
  );
  assert.equal(
    VisitSchema.safeParse({ ...visit, description: "a".repeat(2001) }).success,
    false,
  );
  assert.equal(
    VisitSchema.safeParse({ ...visit, drinkIds: [-1] }).success,
    false,
  );
});
