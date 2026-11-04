import type { NewDrink } from "./visit-validation";

export type DrinkSuggestion = Omit<NewDrink, "type"> & {
  id: string;
  type?: NewDrink["type"];
  sourceUrl: string;
};

type Claim = {
  rank?: string;
  qualifiers?: Record<string, unknown>;
  mainsnak?: {
    datavalue?: { value?: { id?: string; amount?: string; unit?: string } };
  };
};
type Entity = {
  id: string;
  labels?: Record<string, { value: string }>;
  descriptions?: Record<string, { value: string }>;
  claims?: Record<string, Claim[]>;
};

function claims(entity: Entity, property: string) {
  const values = (entity.claims?.[property] || []).filter(
    (claim) => claim.rank !== "deprecated",
  );
  const preferred = values.filter((claim) => claim.rank === "preferred");
  return preferred.length ? preferred : values;
}
function ids(entity: Entity, property: string) {
  return claims(entity, property).flatMap((claim) => {
    const id = claim.mainsnak?.datavalue?.value?.id;
    return id && /^Q\d+$/.test(id) ? [id] : [];
  });
}
function label(entity?: Entity) {
  return entity?.labels?.en?.value || entity?.labels?.mul?.value || "";
}

const beverage =
  /\b(beer|lager|ale|stout|porter|pilsner|cider|wine|whisk(?:e)?y|vodka|rum|gin|tequila|brandy|liqueur|spirit|cocktail|drink|beverage|soda|cola|lemonade|juice|kombucha|seltzer)\b/i;
function drinkType(text: string): NewDrink["type"] | undefined {
  if (/\b(non-alcoholic|alcohol-free|dealcoholized)\b/i.test(text))
    return "Alcohol-free";
  if (/\b(cocktail)\b/i.test(text)) return "Cocktail";
  if (/\b(cider|perry)\b/i.test(text)) return "Cider";
  if (/\b(wine|champagne|prosecco)\b/i.test(text)) return "Wine";
  if (
    /\b(whisk(?:e)?y|vodka|rum|gin|tequila|brandy|liqueur|spirit)\b/i.test(text)
  )
    return "Spirits";
  if (/\b(beer|lager|ale|stout|porter|pilsner)\b/i.test(text)) return "Beer";
  if (/\b(soft drink|soda|cola|lemonade|juice)\b/i.test(text))
    return "Soft drink";
}

// Use structured claims, never infer strength or producer from prose. Ambiguous
// strengths (including regional/historical variants) are left for the user.
export function toDrinkSuggestion(
  entity: Entity,
  related: Record<string, Entity>,
): DrinkSuggestion | undefined {
  const name = label(entity).trim();
  const categories = [...ids(entity, "P31"), ...ids(entity, "P279")]
    .map((id) => label(related[id]))
    .filter(Boolean);
  const description = entity.descriptions?.en?.value || "";
  const drinkCategories = categories.filter((value) => beverage.test(value));
  const clearlyUnrelated =
    /\b(human|family name|film|book|album|song|brewery|distillery|company|business|organization|brand)\b/i;
  if (
    !name ||
    name.length > 100 ||
    (!drinkCategories.length &&
      (categories.some((value) => clearlyUnrelated.test(value)) ||
        !beverage.test(description)))
  )
    return;
  const type = drinkType([...drinkCategories, description].join(" "));
  const style = drinkCategories.find(
    (value) =>
      !/\b(brand|company|business)\b/i.test(value) &&
      !/^(beer|wine|drink|beverage|alcoholic beverage|soft drink|cocktail|spirit)$/i.test(
        value,
      ),
  );
  const brewery = ids(entity, "P176")
    .map((id) => label(related[id]))
    .filter(Boolean)
    .join(", ");
  const strengths = claims(entity, "P2665");
  const amounts = strengths.flatMap((claim) => {
    const value = claim.mainsnak?.datavalue?.value;
    // Q2080811 is percent. Qualified claims may refer to a different date/market.
    if (claim.qualifiers && Object.keys(claim.qualifiers).length) return [];
    if (!value?.unit?.endsWith("/Q2080811") || value.amount === undefined)
      return [];
    const amount = Number(value.amount);
    return Number.isFinite(amount) && amount >= 0 && amount <= 100
      ? [amount]
      : [];
  });
  const distinct = [...new Set(amounts)];
  return {
    id: entity.id,
    name,
    type,
    ...(brewery && brewery.length <= 100 ? { brewery } : {}),
    ...(style && style.length <= 80 ? { style } : {}),
    ...(distinct.length === 1 && amounts.length === strengths.length
      ? { abv: distinct[0] }
      : {}),
    sourceUrl: `https://www.wikidata.org/wiki/${entity.id}`,
  };
}

export function createDrinkLookup(fetcher: typeof fetch = fetch) {
  const cache = new Map<
    string,
    { expires: number; results: DrinkSuggestion[] }
  >();
  const pending = new Map<string, Promise<DrinkSuggestion[]>>();
  let backoffUntil = 0;
  let windowStart = 0;
  let requestCount = 0;
  async function lookup(query: string): Promise<DrinkSuggestion[]> {
    const key = query.trim().replace(/\s+/g, " ").toLowerCase();
    if (key.length < 3 || key.length > 100) return [];
    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.results;
    const running = pending.get(key);
    if (running) return running;
    if (Date.now() < backoffUntil || pending.size >= 4)
      throw new Error("Drink lookup temporarily busy");
    const work = (async () => {
      const signal = AbortSignal.timeout(8000);
      async function api(params: Record<string, string>) {
        if (Date.now() - windowStart > 60000) {
          windowStart = Date.now();
          requestCount = 0;
        }
        if (++requestCount > 60)
          throw new Error("Drink lookup temporarily busy");
        const url = new URL("https://www.wikidata.org/w/api.php");
        url.search = new URLSearchParams({
          format: "json",
          maxlag: "10",
          ...params,
        }).toString();
        const response = await fetcher(url, {
          headers: {
            "User-Agent":
              "BarHoppr/0.1 (https://github.com/maybMedia/barhoppr)",
            Accept: "application/json",
          },
          signal,
          cache: "no-store",
        });
        if (response.status === 429 || response.status === 503) {
          const seconds = Number(response.headers.get("Retry-After"));
          backoffUntil =
            Date.now() + Math.max(60, Math.min(seconds || 60, 3600)) * 1000;
        }
        if (!response.ok) throw new Error("Drink source unavailable");
        const data = await response.json();
        if (data.error) {
          backoffUntil = Date.now() + 60000;
          throw new Error("Drink source unavailable");
        }
        return data;
      }
      const search = await api({
        action: "wbsearchentities",
        search: key,
        language: "en",
        type: "item",
        limit: "10",
      });
      if (!Array.isArray(search.search))
        throw new Error("Invalid drink search response");
      const found = search.search
        .map((entry: { id: string }) => entry.id)
        .filter((id: string) => /^Q\d+$/.test(id))
        .slice(0, 10);
      let results: DrinkSuggestion[] = [];
      if (found.length) {
        const data = await api({
          action: "wbgetentities",
          ids: found.join("|"),
          props: "labels|descriptions|claims",
          languages: "en|mul",
        });
        if (!data.entities) throw new Error("Invalid drink metadata response");
        const entities = found
          .map((id: string) => data.entities[id])
          .filter(Boolean) as Entity[];
        const relatedIds = [
          ...new Set(
            entities.flatMap((entity) =>
              ["P31", "P279", "P176"].flatMap((property) =>
                ids(entity, property),
              ),
            ),
          ),
        ].slice(0, 50);
        const related = relatedIds.length
          ? await api({
              action: "wbgetentities",
              ids: relatedIds.join("|"),
              props: "labels",
              languages: "en|mul",
            })
          : { entities: {} };
        if (!related.entities) throw new Error("Invalid drink labels response");
        results = entities
          .flatMap((entity) => {
            const suggestion = toDrinkSuggestion(entity, related.entities);
            return suggestion ? [suggestion] : [];
          })
          .slice(0, 6);
      }
      if (cache.size >= 100) cache.delete(cache.keys().next().value!);
      cache.set(key, { expires: Date.now() + 15 * 60000, results });
      return results;
    })();
    pending.set(key, work);
    try {
      return await work;
    } finally {
      pending.delete(key);
    }
  }
  return lookup;
}

export const lookupDrinks = createDrinkLookup();
