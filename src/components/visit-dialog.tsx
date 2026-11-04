"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Beer, Loader2, Send, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pub } from "@/types/pub";
import { useSWRConfig } from "swr";
import { VisitDrinkPicker } from "@/components/visit-drink-picker";
import type { NewDrink } from "@/lib/visit-validation";

export function VisitDialog({
  pub,
  onPosted,
}: {
  pub: Pub;
  onPosted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [drinkIds, setDrinkIds] = useState<number[]>([]);
  const [newDrinks, setNewDrinks] = useState<NewDrink[]>([]);
  const [hasDrinkDraft, setHasDrinkDraft] = useState(false);
  const { mutate } = useSWRConfig();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <Beer size={15} />
          Share a visit
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="post-dialog"
          onEscapeKeyDown={(event) => {
            if (
              event.target instanceof HTMLElement &&
              event.target.dataset.suggestionsOpen === "true"
            ) {
              event.preventDefault();
            }
          }}
        >
          <Dialog.Close className="dialog-close" aria-label="Close visit form">
            <X size={19} />
          </Dialog.Close>
          <span className="feature-icon mb-5">
            <Beer size={25} />
          </span>
          <Dialog.Title>What’s pouring here?</Dialog.Title>
          <Dialog.Description className="dialog-description">
            Share what you found at {pub.name}. Every drink you select helps
            others find where it’s served.
          </Dialog.Description>
          <form
            className="post-form"
            onSubmit={async (event) => {
              event.preventDefault();
              if (pending) return;
              if (hasDrinkDraft) {
                setError(
                  "Add your new drink to the visit, or cancel it, before sharing.",
                );
                return;
              }
              if (!rating) {
                setError("Pick a rating from one to five stars.");
                return;
              }
              const form = new FormData(event.currentTarget);
              setPending(true);
              setError("");
              try {
                const response = await fetch(`/api/pubs/${pub.id}/posts`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: form.get("name"),
                    description: form.get("description"),
                    rating,
                    drinkIds,
                    newDrinks,
                  }),
                });
                if (!response.ok) {
                  const result = await response.json();
                  throw new Error(
                    result.error ||
                      "We couldn’t save your visit. Please try again.",
                  );
                }
                setOpen(false);
                setRating(0);
                setDrinkIds([]);
                setNewDrinks([]);
                setHasDrinkDraft(false);
                void mutate("/api/pubs");
                void mutate("/api/drinks");
                onPosted();
              } catch (error) {
                setError(
                  error instanceof Error
                    ? error.message
                    : "We couldn’t save your visit.",
                );
              } finally {
                setPending(false);
              }
            }}
          >
            <fieldset>
              <legend className="field-label">YOUR RATING</legend>
              <div
                className="rating-buttons"
                role="group"
                aria-label="Rate your visit"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    aria-pressed={rating === value}
                    className={value <= rating ? "chosen" : ""}
                    onClick={() => setRating(value)}
                  >
                    <Star
                      size={29}
                      fill={value <= rating ? "currentColor" : "none"}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {rating
                  ? `${rating} out of 5 — ${["", "Not my round", "Could be better", "A good local", "Would come back", "Cheers to that!"][rating]}`
                  : "How did it go?"}
              </span>
            </fieldset>
            <div>
              <label htmlFor="visit-title" className="field-label">
                DRINK OR VISIT TITLE
              </label>
              <input
                id="visit-title"
                name="name"
                className="form-input"
                placeholder="A crisp lager and a sunny afternoon…"
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <VisitDrinkPicker
              pub={pub}
              drinkIds={drinkIds}
              newDrinks={newDrinks}
              onIdsChange={(ids) => {
                setDrinkIds(ids);
                setError("");
              }}
              onNewChange={(drinks) => {
                setNewDrinks(drinks);
                setError("");
              }}
              onDraftChange={setHasDrinkDraft}
              disabled={pending}
            />
            <div>
              <label htmlFor="visit-notes" className="field-label">
                TELL US ABOUT IT <span className="font-normal">(optional)</span>
              </label>
              <textarea
                id="visit-notes"
                name="description"
                className="form-textarea"
                placeholder="The drink, the atmosphere, the little things worth knowing…"
                maxLength={2000}
              />
            </div>
            {error && (
              <p role="alert" className="status-message error-message m-0">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="button-large w-full"
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Send size={17} />
              )}
              {pending ? "Sharing your visit…" : "Share the good stuff"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Your name, rating, and notes will be visible to everyone.
            </p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
