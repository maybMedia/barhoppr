"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import {
  ArrowLeft,
  ArrowUpRight,
  Beer,
  Check,
  Info,
  MapPin,
  MessageCircle,
  Navigation,
  RotateCcw,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/page-transition";
import { VenueImage } from "@/components/venue-image";
import { VisitDialog } from "@/components/visit-dialog";
import { fetchJson } from "@/lib/discovery";
import type { Pub, VisitPost } from "@/types/pub";

export function VenueDetail({ pub, onBack }: { pub: Pub; onBack: () => void }) {
  const { data: session, status } = useSession();
  const [tab, setTab] = useState("drinks");
  const [posted, setPosted] = useState(false);
  const {
    data: posts,
    error,
    isLoading,
    mutate,
  } = useSWR<VisitPost[]>(
    tab === "visits" ? `/api/pubs/${pub.id}/posts` : null,
    fetchJson,
    { shouldRetryOnError: false },
  );
  return (
    <>
      <div className="detail-cover">
        <VenueImage src={pub.image_Url} name={pub.name} />
        <button className="detail-back" onClick={onBack}>
          <ArrowLeft size={13} />
          All venues
        </button>
      </div>
      <div className="detail-summary">
        <h2>{pub.name}</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="tag tag-gold">
            <Beer size={12} />
            {pub.drinks?.length || 0} drinks listed
          </span>
          <span className="tag">
            <MapPin size={12} />
            Local discovery
          </span>
        </div>
        <p>{pub.description}</p>
        <div className="detail-actions">
          <Button asChild variant="outline">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${pub.lat},${pub.long}`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={14} />
              Get directions
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
          {session ? (
            <VisitDialog
              pub={pub}
              onPosted={() => {
                setPosted(true);
                setTab("visits");
                mutate();
              }}
            />
          ) : (
            <Button asChild disabled={status === "loading"}>
              <TransitionLink
                href={`/logIn?callbackUrl=${encodeURIComponent(`/map?pub=${pub.id}`)}`}
              >
                <Beer size={14} />
                Sign in to share
              </TransitionLink>
            </Button>
          )}
        </div>
      </div>
      <div
        className="detail-tabs"
        role="tablist"
        aria-label="Venue details"
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
            return;
          event.preventDefault();
          const keys = ["drinks", "visits", "about"];
          const index = keys.indexOf(tab);
          const next =
            event.key === "Home"
              ? "drinks"
              : event.key === "End"
                ? "about"
                : keys[(index + (event.key === "ArrowRight" ? 1 : 2)) % 3];
          setTab(next);
          document.getElementById(`tab-${next}`)?.focus();
        }}
      >
        {[
          { key: "drinks", label: "Drinks here" },
          { key: "visits", label: "Community" },
          { key: "about", label: "The details" },
        ].map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-controls={`panel-${key}`}
            aria-selected={tab === key}
            tabIndex={tab === key ? 0 : -1}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="detail-section"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
      >
        {tab === "drinks" && (
          <>
            <h3>
              <Beer size={18} />
              Find your flavour
            </h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
              Drinks spotted here by the community. Availability can change, so
              check with the bar.
            </p>
            {pub.drinks?.length ? (
              pub.drinks.map((drink) => (
                <div className="drink-row" key={drink.id}>
                  <span className="drink-icon">
                    <Beer size={19} />
                  </span>
                  <div>
                    <h4>
                      <TransitionLink
                        href={`/search?q=${encodeURIComponent(drink.name)}`}
                        className="inline-flex items-center gap-1"
                        title={`Find venues with ${drink.name}`}
                      >
                        {drink.name}
                        <ArrowUpRight size={12} />
                      </TransitionLink>
                    </h4>
                    <small>
                      {[drink.brewery, drink.style || drink.type]
                        .filter(Boolean)
                        .join(" · ") || "Something worth a try"}
                    </small>
                    {drink.lastReportedAt != null && (
                      <small>
                        Last reported{" "}
                        {new Intl.DateTimeFormat("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(drink.lastReportedAt)}
                      </small>
                    )}
                  </div>
                  {drink.abv != null && (
                    <span className="tag">{drink.abv}%</span>
                  )}
                </div>
              ))
            ) : (
              <p className="detail-empty">
                No drinks have been reported yet. Share a visit and choose from
                all drinks, or add one you found, to put it on the map.
              </p>
            )}
          </>
        )}
        {tab === "visits" && (
          <>
            <h3>
              <MessageCircle size={18} />
              Around the table
            </h3>
            {posted && (
              <p role="status" className="status-message">
                <Check size={15} />
                Your visit is shared. Cheers!
              </p>
            )}
            {isLoading ? (
              <div className="skeleton h-28" aria-label="Loading visit posts" />
            ) : error ? (
              <div className="detail-empty">
                <p>We couldn’t load community visits just now.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => mutate()}
                >
                  <RotateCcw size={13} />
                  Try again
                </Button>
              </div>
            ) : posts?.length ? (
              posts.map((post) => (
                <article className="community-card" key={post.id}>
                  <div className="community-author">
                    <span className="community-avatar" aria-hidden="true">
                      {post.author.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>{post.author}</strong>
                      <small>
                        {new Intl.DateTimeFormat("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(post.createdAt)}
                      </small>
                    </div>
                  </div>
                  {post.rating != null && (
                    <div
                      className="stars"
                      aria-label={`${post.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={12}
                          fill={value <= post.rating! ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  )}
                  <h4>{post.name}</h4>
                  <p>{post.description}</p>
                  {post.drinks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.drinks.map((drink) => (
                        <span className="tag tag-gold" key={drink.id}>
                          {drink.name}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="detail-empty">
                <MessageCircle size={28} className="text-tertiary mb-3" />
                <p>
                  No visits shared yet. Be the first to tell us about your
                  round.
                </p>
              </div>
            )}
            {!session && (
              <TransitionLink
                href={`/logIn?callbackUrl=${encodeURIComponent(`/map?pub=${pub.id}`)}`}
                className="text-link mt-3"
              >
                Join the conversation
                <Beer size={14} />
              </TransitionLink>
            )}
          </>
        )}
        {tab === "about" && (
          <>
            <h3>
              <Info size={18} />A little more local
            </h3>
            <p className="detail-empty pt-0">{pub.description}</p>
            <div className="border-t pt-4">
              <span className="field-label">FIND YOUR WAY</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Open directions to plan your route to the venue.
              </p>
              <a
                className="text-link mt-3"
                href={`https://www.openstreetmap.org/?mlat=${pub.lat}&mlon=${pub.long}#map=17/${pub.lat}/${pub.long}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin size={14} />
                View on OpenStreetMap
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
