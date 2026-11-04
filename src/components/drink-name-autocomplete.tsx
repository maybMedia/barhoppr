"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Globe, Loader2 } from "lucide-react";
import type { DrinkSuggestion } from "@/lib/drink-suggestions";

export function DrinkNameAutocomplete({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (name: string, previousSelection?: DrinkSuggestion) => void;
  onSelect: (drink: DrinkSuggestion) => void;
}) {
  const listId = useId();
  const container = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [dismissed, setDismissed] = useState(false);
  const [selected, setSelected] = useState<DrinkSuggestion>();
  const [result, setResult] = useState<{
    query: string;
    suggestions: DrinkSuggestion[];
    error?: boolean;
  }>();
  const query = value.trim();
  const eligible = query.length >= 3 && !selected;
  const current = result?.query === query ? result : undefined;
  const suggestions = current?.suggestions || [];
  const open = focused && eligible && !dismissed;

  useEffect(() => {
    if (open && current)
      container.current?.scrollIntoView({ block: "nearest" });
  }, [open, current]);
  useEffect(() => {
    if (active >= 0)
      document
        .getElementById(`${listId}-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  useEffect(() => {
    if (!eligible) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/drinks/suggestions?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Lookup unavailable");
        const data = await response.json();
        if (!Array.isArray(data.suggestions))
          throw new Error("Invalid suggestions");
        if (!controller.signal.aborted)
          setResult({ query, suggestions: data.suggestions });
      } catch {
        if (!controller.signal.aborted)
          setResult({ query, suggestions: [], error: true });
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, eligible]);

  const choose = (drink: DrinkSuggestion) => {
    onSelect(drink);
    setSelected(drink);
    setDismissed(true);
    setActive(-1);
  };

  return (
    <div
      ref={container}
      className="drink-autocomplete"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
          setActive(-1);
        }
      }}
    >
      <label htmlFor="new-drink-name" className="field-label">
        DRINK NAME
      </label>
      <input
        id="new-drink-name"
        className="form-input"
        role="combobox"
        data-suggestions-open={open}
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={open && suggestions.length ? listId : undefined}
        aria-activedescendant={
          open && active >= 0 && suggestions[active]
            ? `${listId}-${active}`
            : undefined
        }
        aria-describedby={`${listId}-help`}
        autoComplete="off"
        autoFocus
        value={value}
        onChange={(event) => {
          setSelected(undefined);
          setDismissed(false);
          setActive(-1);
          setResult(undefined);
          onChange(event.target.value, selected);
        }}
        onFocus={() => {
          setFocused(true);
          setDismissed(false);
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Escape" && open) {
            event.preventDefault();
            event.stopPropagation();
            setDismissed(true);
            setActive(-1);
          }
          if (
            (event.key === "ArrowDown" || event.key === "ArrowUp") &&
            suggestions.length
          ) {
            event.preventDefault();
            setDismissed(false);
            setActive((index) =>
              event.key === "ArrowDown"
                ? (index + 1) % suggestions.length
                : index <= 0
                  ? suggestions.length - 1
                  : index - 1,
            );
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (open && active >= 0 && suggestions[active])
              choose(suggestions[active]);
          }
        }}
        maxLength={100}
        placeholder="e.g. Pacific Ale"
      />
      {open && (
        <div className="drink-suggestions">
          {!current ? (
            <p className="drink-suggestions-status" role="status">
              <Loader2 size={13} className="animate-spin" /> Looking for drinks…
            </p>
          ) : current.error ? (
            <p className="drink-suggestions-status" role="status">
              Online suggestions are unavailable. You can enter the details
              yourself.
            </p>
          ) : suggestions.length ? (
            <>
              <div className="drink-suggestions-heading">
                <Globe size={12} /> ONLINE MATCHES · WIKIDATA
              </div>
              <div id={listId} role="listbox" aria-label="Drink suggestions">
                {suggestions.map((drink, index) => (
                  <button
                    key={drink.id}
                    id={`${listId}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={active === index}
                    tabIndex={-1}
                    onMouseDown={(event) => event.preventDefault()}
                    onPointerMove={() => setActive(index)}
                    onClick={() => choose(drink)}
                  >
                    <span>
                      <strong>{drink.name}</strong>
                      <small>
                        {[
                          drink.brewery,
                          drink.style || drink.type,
                          drink.abv !== undefined
                            ? `${drink.abv}% ABV`
                            : undefined,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Select to fill available details"}
                      </small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="drink-suggestions-status" role="status">
              No online matches. Add the drink’s details below.
            </p>
          )}
        </div>
      )}
      <p
        id={`${listId}-help`}
        className="drink-autocomplete-help"
        role="status"
      >
        {selected ? (
          <>
            <Check size={12} /> Details from{" "}
            <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
              Wikidata
            </a>
            . Check them against the drink you found.
          </>
        ) : (
          "Type at least 3 characters, then choose a match to fill available details. You can edit every field."
        )}
      </p>
    </div>
  );
}
