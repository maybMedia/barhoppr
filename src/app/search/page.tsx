import { Suspense } from "react";
import { Beer } from "lucide-react";
import { SearchExperience } from "@/components/search-experience";

export default function SearchPage() {
  return (
    <main id="main-content" className="page-width">
      <header className="page-heading">
        <span className="eyebrow">
          <Beer size={15} />
          Find your flavour
        </span>
        <h1>What’s your next round?</h1>
        <p>
          Something familiar or a new favourite. Search a drink, explore an
          area, or see what’s pouring near you.
        </p>
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
          <div className="skeleton h-80 mb-16" aria-label="Loading search" />
        }
      >
        <SearchExperience />
      </Suspense>
    </main>
  );
}
