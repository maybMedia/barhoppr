import {
  ArrowRight,
  ArrowUpRight,
  Beer,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { BeerArt } from "@/components/beer-art";
import { QuickSearch, TransitionLink } from "@/components/page-transition";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Compass,
    title: "Find your kind of local.",
    text: "A classic corner pub or somewhere new? Explore the map and see what’s pouring nearby.",
    href: "/map",
    link: "Explore the map",
  },
  {
    icon: Beer,
    title: "Follow your favourite.",
    text: "That crisp lager. That hazy pale. Find the drinks you love and the places serving them.",
    href: "/search",
    link: "Find a drink",
  },
  {
    icon: UsersRound,
    title: "Share the good stuff.",
    text: "Found a new favourite? Rate your visit, leave a note, and help the next person find theirs.",
    href: "/map",
    link: "Join the conversation",
  },
];

export default function Home() {
  return (
    <main id="main-content">
      <section className="hero" aria-labelledby="hero-title">
        <div className="page-width hero-stage">
          <div className="hero-topline">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              For the love of a good local
            </span>
            <span className="hero-topline-note">DISCOVER. SIP. REPEAT.</span>
          </div>
          <div className="hero-intro">
            <p>
              <span>Find your drink.</span>
              <span>Meet your people.</span>
            </p>
            <span>
              Your favourite on tap.{" "}
              <span className="hero-intro-detail">
                Your next local, just around the corner.
              </span>
            </span>
          </div>
          <div className="hero-edition" aria-hidden="true">
            <span>
              THE NEXT
              <br />
              GOOD FIND
            </span>
            <strong>01</strong>
          </div>
          <div className="hero-halo" aria-hidden="true" />
          <div className="hero-floor" aria-hidden="true" />
          <h1 id="hero-title" className="hero-headline">
            <span>Good</span> <span>times.</span>
          </h1>
          <BeerArt />
          <div className="hero-bottom">
            <div className="hero-primary-action">
              <Button asChild className="button-large button-dark">
                <TransitionLink href="/map">
                  <MapPin size={17} />
                  Find my next local
                  <ArrowRight size={17} />
                </TransitionLink>
              </Button>
              <span>
                <ShieldCheck size={13} />
                Free to explore. No sign-up needed.
              </span>
            </div>
            <p className="hero-bottom-caption">
              A GOOD ROUND.
              <br />
              <span>A GREAT START.</span>
            </p>
            <TransitionLink href="/search" className="hero-search-link">
              <span>Already have a favourite?</span>
              <strong>
                Find your flavour
                <ArrowUpRight size={20} />
              </strong>
            </TransitionLink>
          </div>
        </div>
      </section>
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              Find your local<i>✳︎</i>Follow the good beer<i>✳︎</i>Make a night of
              it<i>✳︎</i>Cheers to that<i>✳︎</i>
            </span>
          ))}
        </div>
      </div>
      <section className="section page-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              <Sparkles size={15} />
              Less searching. More cheers.
            </span>
            <h2>
              A good night starts
              <br />
              with a great find.
            </h2>
            <p>
              Your favourite drink and your next favourite place.
              <br />
              We bring them a little closer together.
            </p>
          </div>
          <TransitionLink href="/about" className="text-link">
            Meet BarHoppr
            <ArrowRight size={16} />
          </TransitionLink>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text, href, link }, i) => (
            <article key={title} className="feature-card">
              <span className="feature-number">0{i + 1}</span>
              <span className="feature-icon">
                <Icon size={25} strokeWidth={1.7} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <TransitionLink href={href} className="text-link mt-6">
                {link}
                <ArrowRight size={15} />
              </TransitionLink>
            </article>
          ))}
        </div>
      </section>
      <section className="page-width section home-search-section">
        <div className="home-search-card">
          <div>
            <span className="eyebrow mb-4">
              <Beer size={15} />
              Something in mind?
            </span>
            <h2>
              Good taste.
              <br />
              Great starting point.
            </h2>
            <p>
              Search a drink, a brewery, or your favourite style.
              <br />
              We’ll help you find where to pull up a stool.
            </p>
          </div>
          <div>
            <QuickSearch />
            <div className="search-suggestions">
              <span>Try a little inspiration:</span>
              <TransitionLink href="/search?q=lager">Lager</TransitionLink>
              <TransitionLink href="/search?q=pale">Pale ale</TransitionLink>
              <TransitionLink href="/search?q=cider">Cider</TransitionLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
