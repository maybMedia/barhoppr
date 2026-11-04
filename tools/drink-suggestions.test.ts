import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createDrinkLookup,
  toDrinkSuggestion,
} from "../src/lib/drink-suggestions";

const ref = (id: string) => ({ mainsnak: { datavalue: { value: { id } } } });
const strength = (
  amount: string,
  unit = "http://www.wikidata.org/entity/Q2080811",
) => ({ mainsnak: { datavalue: { value: { amount, unit } } } });
const entity = {
  id: "Q1",
  labels: { en: { value: "Golden Hour" } },
  descriptions: { en: { value: "Australian pale ale" } },
  claims: { P31: [ref("Q2")], P176: [ref("Q3")], P2665: [strength("+4.5")] },
};
const related = {
  Q2: { id: "Q2", labels: { en: { value: "pale ale" } } },
  Q3: { id: "Q3", labels: { en: { value: "Neighbourhood Brewing" } } },
};

test("online matches map structured drink metadata and retain source attribution", () => {
  assert.deepEqual(toDrinkSuggestion(entity, related), {
    id: "Q1",
    name: "Golden Hour",
    brewery: "Neighbourhood Brewing",
    type: "Beer",
    style: "pale ale",
    abv: 4.5,
    sourceUrl: "https://www.wikidata.org/wiki/Q1",
  });
  assert.equal(
    toDrinkSuggestion({ ...entity, claims: { P31: [ref("Q2")] } }, related)
      ?.abv,
    undefined,
  );
});

test("unrelated names and breweries are excluded; ambiguous ABV is never guessed", () => {
  assert.equal(
    toDrinkSuggestion(
      {
        ...entity,
        descriptions: { en: { value: "beer brewing company" } },
        claims: { P31: [ref("Q4")] },
      },
      { Q4: { id: "Q4", labels: { en: { value: "brewery" } } } },
    ),
    undefined,
  );
  assert.equal(
    toDrinkSuggestion(
      { ...entity, descriptions: { en: { value: "family name" } }, claims: {} },
      {},
    ),
    undefined,
  );
  for (const values of [
    [strength("4"), strength("5")],
    [strength("9", "grams")],
    [strength("101")],
    [{ ...strength("4"), qualifiers: { P585: [] } }],
  ]) {
    assert.equal(
      toDrinkSuggestion(
        { ...entity, claims: { ...entity.claims, P2665: values } },
        related,
      )?.abv,
      undefined,
    );
  }
  assert.equal(
    toDrinkSuggestion(
      { ...entity, claims: { ...entity.claims, P2665: [strength("0")] } },
      related,
    )?.abv,
    0,
  );
});

test("lookup batches metadata, coalesces requests, caches queries and validates length", async () => {
  const urls: URL[] = [];
  const lookup = createDrinkLookup((async (input, init) => {
    const url = new URL(String(input));
    urls.push(url);
    assert.match(
      String((init?.headers as Record<string, string>)["User-Agent"]),
      /BarHoppr/,
    );
    const data =
      url.searchParams.get("action") === "wbsearchentities"
        ? { search: [{ id: "Q1" }] }
        : url.searchParams.get("props") === "labels"
          ? { entities: related }
          : { entities: { Q1: entity } };
    return Response.json(data);
  }) as typeof fetch);
  assert.deepEqual(await lookup("ab"), []);
  assert.deepEqual(await lookup("x".repeat(101)), []);
  const [first, second] = await Promise.all([
    lookup("Golden Hour"),
    lookup("  golden   hour "),
  ]);
  assert.deepEqual(first, second);
  assert.equal(first[0].abv, 4.5);
  assert.equal(urls.length, 3);
  await lookup("GOLDEN HOUR");
  assert.equal(urls.length, 3);
  assert.equal(urls[0].hostname, "www.wikidata.org");
});

test("provider throttling and API errors back off without inventing results", async () => {
  for (const response of [
    Response.json({}, { status: 429, headers: { "Retry-After": "120" } }),
    Response.json({ error: { code: "maxlag" } }),
  ]) {
    let calls = 0;
    const lookup = createDrinkLookup((async () => {
      calls++;
      return response;
    }) as typeof fetch);
    await assert.rejects(lookup("Guinness"));
    await assert.rejects(lookup("Victoria Bitter"));
    assert.equal(calls, 1);
  }
});
