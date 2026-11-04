import { ArrowRight, Beer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/page-transition";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <div>
        <Beer size={64} strokeWidth={1.3} />
        <span className="eyebrow justify-center">404 · An empty glass</span>
        <h1>Missed the round?</h1>
        <p>
          This page seems to have wandered off. There’s still plenty of good
          stuff to discover.
        </p>
        <Button asChild className="button-large">
          <TransitionLink href="/map">
            Back to the good places
            <ArrowRight size={17} />
          </TransitionLink>
        </Button>
      </div>
    </main>
  );
}
