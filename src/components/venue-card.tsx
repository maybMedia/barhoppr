import { ArrowUpRight, Beer, MapPin } from "lucide-react";
import { TransitionLink } from "@/components/page-transition";
import { VenueImage } from "@/components/venue-image";
import { distanceKm, type Coordinates } from "@/lib/discovery";
import type { Pub } from "@/types/pub";

export function VenueCard({
  pub,
  origin,
}: {
  pub: Pub;
  origin?: Coordinates | null;
}) {
  const drinks = pub.drinks || [];
  const distance = origin
    ? distanceKm(origin, { lat: pub.lat, lng: pub.long })
    : null;
  return (
    <article className="venue-card">
      <div className="venue-image">
        <VenueImage src={pub.image_Url} name={pub.name} />
        <span className="tag">
          <Beer size={12} />
          {drinks.length} {drinks.length === 1 ? "drink" : "drinks"} listed
        </span>
      </div>
      <div className="venue-card-body">
        <h3>
          <TransitionLink href={`/map?pub=${pub.id}`}>
            {pub.name}
          </TransitionLink>
        </h3>
        <p className="venue-description line-clamp-2">{pub.description}</p>
        <div className="venue-drinks">
          {drinks.slice(0, 3).map((drink) => (
            <span className="tag tag-gold" key={drink.id}>
              {drink.name}
            </span>
          ))}
          {drinks.length > 3 && (
            <span className="tag">+{drinks.length - 3} more</span>
          )}
        </div>
        <div className="venue-card-bottom">
          <small>
            <MapPin size={12} />
            {distance === null
              ? "Find it on the map"
              : `${distance.toFixed(1)} km away`}
          </small>
          <TransitionLink className="text-link" href={`/map?pub=${pub.id}`}>
            Take a look
            <ArrowUpRight size={15} />
          </TransitionLink>
        </div>
      </div>
    </article>
  );
}
