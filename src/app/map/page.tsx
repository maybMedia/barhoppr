import { Suspense } from "react";
import { Beer, Compass } from "lucide-react";
import MapClient from "@/components/MapClient";

export default function MapPage() {
  return (
    <main id="main-content" className="page-width map-page">
      <header className="page-heading page-heading-row">
        <div>
          <span className="eyebrow">
            <Compass size={15} />
            Good places. Great rounds.
          </span>
          <h1>Your next local awaits.</h1>
          <p>
            Follow a golden pin. Discover the drinks. Stay for the good company.
          </p>
        </div>
        <span className="tag tag-gold">
          <Beer size={14} />
          Find your kind of place
        </span>
      </header>
      {process.env.NEXT_PUBLIC_DEMO_DATA === "true" && (
        <p className="status-message -mt-2 mb-5 text-[11px]">
          <Beer size={15} />
          Local demo: fictional venues, drinks, and sample visits for
          development.
        </p>
      )}
      <Suspense
        fallback={
          <div className="skeleton h-[660px]" aria-label="Loading map" />
        }
      >
        <MapClient />
      </Suspense>
    </main>
  );
}
