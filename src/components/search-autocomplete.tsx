"use client";

import { useEffect, useRef, useState } from "react";
import { Beer, MapPin, Search, type LucideIcon } from "lucide-react";
import type { SearchSuggestion } from "@/lib/search-autocomplete-menu";

export function SearchAutocomplete({
  id,
  label,
  placeholder,
  value,
  onChange,
  suggestions,
  icon: Icon,
  loading,
  unavailable,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: SearchSuggestion[];
  icon: LucideIcon;
  loading: boolean;
  unavailable: boolean;
}) {
  const [settled, setSettled] = useState("");
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const list = useRef<HTMLDivElement>(null);
  const open =
    focused && !dismissed && value.trim().length >= 2 && settled === value;
  const listId = `${id}-suggestions`;

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), 500);
    return () => clearTimeout(timer);
  }, [value]);
  useEffect(() => {
    if (active >= 0)
      list.current
        ?.querySelectorAll('[role="option"]')
        [active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    setDismissed(true);
    setActive(-1);
  };
  return (
    <div
      className="search-autocomplete"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
          setActive(-1);
        }
      }}
    >
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="input-wrap">
        <Icon size={18} />
        <input
          id={id}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setDismissed(false);
            setActive(-1);
            setSettled("");
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
              settled === value &&
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
            if (
              event.key === "Enter" &&
              open &&
              active >= 0 &&
              suggestions[active]
            ) {
              event.preventDefault();
              choose(suggestions[active]);
            }
          }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={
            open && !loading && !unavailable && suggestions.length > 0
          }
          aria-controls={
            open && !loading && !unavailable && suggestions.length
              ? listId
              : undefined
          }
          aria-activedescendant={
            open && active >= 0 && suggestions[active]
              ? `${listId}-${active}`
              : undefined
          }
          autoComplete="off"
          maxLength={120}
          placeholder={placeholder}
        />
      </div>
      {open && (
        <div className="search-autocomplete-menu">
          {loading || unavailable || !suggestions.length ? (
            <p role="status">
              {loading
                ? "Loading suggestions…"
                : unavailable
                  ? "Suggestions are unavailable. You can still search."
                  : "No matching suggestions. You can still search this text."}
            </p>
          ) : (
            <>
              <div className="search-autocomplete-menu-heading">
                {id === "location-query"
                  ? "MATCHING VENUES · NAME OR AREA"
                  : "FROM OUR DRINKS & VENUES"}
              </div>
              <div
                id={listId}
                ref={list}
                role="listbox"
                aria-label={`${label} suggestions`}
              >
                {suggestions.map((suggestion, index) => {
                  const ItemIcon =
                    suggestion.kind === "Venue"
                      ? MapPin
                      : suggestion.kind === "Drink"
                        ? Beer
                        : Search;
                  return (
                    <button
                      type="button"
                      role="option"
                      key={suggestion.id}
                      id={`${listId}-${index}`}
                      aria-selected={index === active}
                      tabIndex={-1}
                      onMouseDown={(event) => event.preventDefault()}
                      onPointerMove={() => setActive(index)}
                      onClick={() => choose(suggestion)}
                    >
                      <ItemIcon size={16} aria-hidden="true" />
                      <span>
                        <strong>{suggestion.value}</strong>
                        <small>
                          {[
                            suggestion.kind,
                            suggestion.detail,
                            suggestion.kind !== "Venue"
                              ? `${suggestion.venues} ${suggestion.venues === 1 ? "venue" : "venues"}`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
