import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/page-transition";
import { BrandMark } from "@/components/brand-mark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-width footer-main">
        <div>
          <TransitionLink href="/" className="brand">
            <span className="brand-icon">
              <BrandMark />
            </span>
            BarHoppr<span className="brand-dot">.</span>
          </TransitionLink>
          <p>Good beer. Good places. Your people.</p>
        </div>
        <div className="footer-links">
          <TransitionLink href="/map">
            Find your local <ArrowUpRight size={15} />
          </TransitionLink>
          <TransitionLink href="/search">
            Find a drink <ArrowUpRight size={15} />
          </TransitionLink>
          <TransitionLink href="/about">
            Our story <ArrowUpRight size={15} />
          </TransitionLink>
        </div>
      </div>
      <div className="page-width footer-bottom">
        <span>Made for the next great catch-up.</span>
        <span>Enjoy the good times. Drink responsibly. 18+</span>
      </div>
    </footer>
  );
}
