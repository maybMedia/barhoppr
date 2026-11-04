"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Beer, Check, Loader2, Plus, RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrinkNameAutocomplete } from "@/components/drink-name-autocomplete";
import { fetchJson } from "@/lib/discovery";
import {
  drinkIdentity,
  DrinkTypes,
  NewDrinkSchema,
  type NewDrink,
} from "@/lib/visit-validation";
import type { Pub, PubDrink } from "@/types/pub";

export function VisitDrinkPicker({
  pub,
  drinkIds,
  newDrinks,
  onIdsChange,
  onNewChange,
  onDraftChange,
  disabled,
}: {
  pub: Pub;
  drinkIds: number[];
  newDrinks: NewDrink[];
  onIdsChange: (ids: number[]) => void;
  onNewChange: (drinks: NewDrink[]) => void;
  onDraftChange: (hasDraft: boolean) => void;
  disabled: boolean;
}) {
  const { data, error, isLoading, mutate } = useSWR<PubDrink[]>(
    "/api/drinks",
    fetchJson,
    { shouldRetryOnError: false },
  );
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    brewery: "",
    type: "Beer",
    style: "",
    abv: "",
  });
  const [message, setMessage] = useState("");
  useEffect(() => {
    onDraftChange(adding && Boolean(draft.name.trim()));
  }, [adding, draft.name, onDraftChange]);
  useEffect(() => () => onDraftChange(false), [onDraftChange]);
  const catalogue = useMemo(
    () => [
      ...new Map(
        [...(data || []), ...(pub.drinks || [])].map((drink) => [
          drink.id,
          drink,
        ]),
      ).values(),
    ],
    [data, pub.drinks],
  );
  const here = new Set((pub.drinks || []).map((drink) => drink.id));
  const words = query.toLowerCase().trim().split(/\s+/);
  const matches = catalogue
    .filter((drink) =>
      words.every((word) =>
        `${drink.name} ${drink.brewery || ""} ${drink.style || ""}`
          .toLowerCase()
          .includes(word),
      ),
    )
    .sort(
      (a, b) =>
        Number(here.has(b.id)) - Number(here.has(a.id)) ||
        a.name.localeCompare(b.name),
    );
  const toggle = (id: number) => {
    setMessage("");
    if (drinkIds.includes(id))
      onIdsChange(drinkIds.filter((value) => value !== id));
    else if (drinkIds.length + newDrinks.length < 30)
      onIdsChange([...drinkIds, id]);
    else setMessage("Choose up to 30 drinks per visit.");
  };
  const addDrink = () => {
    const parsed = NewDrinkSchema.safeParse({
      ...draft,
      abv: draft.abv.trim() ? Number(draft.abv) : undefined,
    });
    if (!parsed.success) {
      setMessage(
        "Give the drink a name (2–100 characters), choose its type, and use an ABV between 0 and 100 if known.",
      );
      return;
    }
    const entry = parsed.data;
    const existing = catalogue.find(
      (drink) => drinkIdentity(drink) === drinkIdentity(entry),
    );
    if (
      drinkIds.length + newDrinks.length >= 30 &&
      (!existing || !drinkIds.includes(existing.id))
    ) {
      setMessage("Choose up to 30 drinks per visit.");
      return;
    }
    if (existing) {
      if (!drinkIds.includes(existing.id))
        onIdsChange([...drinkIds, existing.id]);
    } else if (
      !newDrinks.some((drink) => drinkIdentity(drink) === drinkIdentity(entry))
    ) {
      if (newDrinks.length >= 5) {
        setMessage("You can add up to 5 new drinks in one visit.");
        return;
      }
      onNewChange([...newDrinks, entry]);
    }
    setDraft({ name: "", brewery: "", type: "Beer", style: "", abv: "" });
    setAdding(false);
    setQuery("");
    setMessage("");
  };
  return (
    <fieldset disabled={disabled} className="visit-drink-picker">
      <legend className="field-label">
        WHAT DRINKS DID YOU FIND HERE?{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
      </legend>
      <p className="drink-picker-help">
        Search all drinks, or add one we haven’t seen yet. Your selections will
        be listed at {pub.name} to help others find them.
      </p>
      {(drinkIds.length > 0 || newDrinks.length > 0) && (
        <div className="picked-drinks" aria-label="Selected drinks">
          {drinkIds.map((id) => {
            const entry = catalogue.find((drink) => drink.id === id);
            return (
              <span className="tag tag-gold" key={id}>
                <Check size={12} />
                {entry?.name || "Selected drink"}
                {entry?.brewery && <span> · {entry.brewery}</span>}
                <button
                  type="button"
                  aria-label={`Remove ${entry?.name || "drink"}`}
                  onClick={() => toggle(id)}
                >
                  <X size={13} />
                </button>
              </span>
            );
          })}
          {newDrinks.map((entry, index) => (
            <span className="tag tag-gold" key={index}>
              <Plus size={12} />
              {entry.name}
              <span className="text-muted-foreground">New</span>
              <button
                type="button"
                aria-label={`Remove ${entry.name}`}
                onClick={() =>
                  onNewChange(newDrinks.filter((_, i) => i !== index))
                }
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <label htmlFor="visit-drink-search" className="sr-only">
        Search all drinks
      </label>
      <div className="input-wrap">
        <Search size={16} />
        <input
          id="visit-drink-search"
          placeholder="Search drink, brewery, or style…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={100}
        />
      </div>
      {isLoading && (
        <p className="drink-picker-help flex items-center gap-2" role="status">
          <Loader2 size={13} className="animate-spin" />
          Loading the drink catalogue…
        </p>
      )}
      {error && (
        <p className="drink-picker-help" role="alert">
          The catalogue couldn’t load. You can still select a listed drink or
          add a new one.{" "}
          <button className="text-link" type="button" onClick={() => mutate()}>
            <RotateCcw size={12} />
            Retry
          </button>
        </p>
      )}
      <div className="drink-picker-results" aria-label="Drink catalogue">
        {matches.slice(0, 20).map((entry) => (
          <label key={entry.id} className="drink-picker-option">
            <input
              type="checkbox"
              checked={drinkIds.includes(entry.id)}
              onChange={() => toggle(entry.id)}
            />
            <span>
              <strong>{entry.name}</strong>
              <small>
                {[entry.brewery, entry.style || entry.type]
                  .filter(Boolean)
                  .join(" · ")}
              </small>
            </span>
            {here.has(entry.id) && (
              <small className="drink-listed-here">Listed here</small>
            )}
          </label>
        ))}
        {!isLoading && !matches.length && (
          <p className="drink-picker-help p-3">
            No matching drinks yet. Add the one you found below.
          </p>
        )}
      </div>
      {matches.length > 20 && (
        <p className="drink-picker-help">
          Showing 20 of {matches.length}. Type a little more to narrow it down.
        </p>
      )}
      {!adding ? (
        <button
          type="button"
          className="add-drink-toggle"
          onClick={() => {
            setAdding(true);
            setDraft((draft) => ({ ...draft, name: query.trim() }));
            setMessage("");
          }}
          disabled={newDrinks.length >= 5}
        >
          <Plus size={15} />
          Can’t find it? Add a drink
        </button>
      ) : (
        <div className="new-drink-panel">
          <div className="flex justify-between items-center gap-3">
            <h3>
              <Beer size={16} />
              Add the drink you found
            </h3>
            <button
              type="button"
              aria-label="Cancel new drink"
              onClick={() => {
                setAdding(false);
                setDraft({
                  name: "",
                  brewery: "",
                  type: "Beer",
                  style: "",
                  abv: "",
                });
                setMessage("");
              }}
            >
              <X size={17} />
            </button>
          </div>
          <DrinkNameAutocomplete
            value={draft.name}
            onChange={(name, selected) =>
              setDraft((previous) => ({
                ...previous,
                name,
                ...(selected
                  ? {
                      brewery:
                        previous.brewery === selected.brewery
                          ? ""
                          : previous.brewery,
                      style:
                        previous.style === selected.style ? "" : previous.style,
                      abv:
                        previous.abv === String(selected.abv)
                          ? ""
                          : previous.abv,
                      type:
                        previous.type === selected.type
                          ? "Beer"
                          : previous.type,
                    }
                  : {}),
              }))
            }
            onSelect={(drink) =>
              setDraft((previous) => ({
                ...previous,
                name: drink.name,
                brewery: drink.brewery ?? "",
                type: drink.type ?? "Other",
                style: drink.style ?? "",
                abv: drink.abv !== undefined ? String(drink.abv) : "",
              }))
            }
          />
          <div>
            <label htmlFor="new-drink-brewery" className="field-label">
              BREWERY / PRODUCER <span className="font-normal">(if known)</span>
            </label>
            <input
              id="new-drink-brewery"
              className="form-input"
              value={draft.brewery}
              onChange={(e) => setDraft({ ...draft, brewery: e.target.value })}
              maxLength={100}
              placeholder="Helps distinguish drinks with the same name"
            />
          </div>
          <div className="new-drink-fields">
            <div>
              <label htmlFor="new-drink-type" className="field-label">
                TYPE
              </label>
              <select
                id="new-drink-type"
                className="form-input"
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              >
                {DrinkTypes.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-drink-abv" className="field-label">
                ABV % <span className="font-normal">(if known)</span>
              </label>
              <input
                id="new-drink-abv"
                className="form-input"
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={draft.abv}
                onChange={(e) => setDraft({ ...draft, abv: e.target.value })}
                placeholder="e.g. 4.4"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-drink-style" className="field-label">
              STYLE <span className="font-normal">(if known)</span>
            </label>
            <input
              id="new-drink-style"
              className="form-input"
              value={draft.style}
              onChange={(e) => setDraft({ ...draft, style: e.target.value })}
              maxLength={80}
              placeholder="e.g. Pale Ale"
            />
          </div>
          <Button type="button" variant="outline" onClick={addDrink}>
            <Plus size={15} />
            Add drink to visit
          </Button>
        </div>
      )}
      {message && (
        <p className="drink-picker-help error-message" role="alert">
          {message}
        </p>
      )}
    </fieldset>
  );
}
