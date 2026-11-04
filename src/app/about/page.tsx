import {
  ArrowRight,
  Beer,
  Compass,
  Heart,
  MapPin,
  MessageCircle,
  PartyPopper,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { TransitionLink } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="page-width about-hero">
        <div>
          <span className="eyebrow eyebrow-pill">
            <Heart size={14} />
            Here’s to the good locals
          </span>
          <h1>
            Life’s too short
            <br />
            for{" "}
            <em>
              “where should
              <br />
              we go?”
            </em>
          </h1>
          <p>
            We believe the best nights start with a simple plan: a drink you
            love, a place that feels right, and your favourite people around the
            table.
          </p>
          <p className="mt-4">
            BarHoppr helps you find that place. Less group-chat indecision. More
            “meet you there.”
          </p>
          <Button asChild className="button-large button-dark mt-7">
            <TransitionLink href="/map">
              Find your next local
              <ArrowRight size={17} />
            </TransitionLink>
          </Button>
        </div>
        <div className="about-graphic" aria-hidden="true">
          <Sparkles className="about-spark" />
          <BrandMark size={105} className="about-logo" />
          <strong>
            GOOD BEER.
            <br />
            BETTER COMPANY.
          </strong>
          <p>That’s the whole idea.</p>
        </div>
      </section>
      <section className="section values-section">
        <div className="page-width">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <PartyPopper size={15} />A little more local
              </span>
              <h2>Built around the good stuff.</h2>
            </div>
          </div>
          <div className="feature-grid">
            {[
              {
                icon: MapPin,
                title: "Places with personality.",
                text: "From a neighbourhood favourite to a happy accidental discovery. Find the pubs and bars that make a place feel like home.",
              },
              {
                icon: Beer,
                title: "Your taste, your round.",
                text: "A familiar favourite or something you’ve never tried. Search the drinks listed at local venues and follow your curiosity.",
              },
              {
                icon: UsersRound,
                title: "Better when it’s shared.",
                text: "Real visits and honest notes from people who’ve pulled up a stool. Share your experience and help someone find their next favourite.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <article className="feature-card" key={title}>
                <span className="feature-number">0{i + 1}</span>
                <span className="feature-icon">
                  <Icon size={25} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section page-width about-bottom">
        <div>
          <span className="eyebrow">
            <Compass size={15} />A very good plan
          </span>
          <h2 className="about-title">
            From “any ideas?”
            <br />
            to “see you there.”
          </h2>
          <p>
            No complicated planning required. Explore freely, then sign in when
            you’re ready to add your own visit to the conversation.
          </p>
          <Button asChild className="button-large">
            <TransitionLink href="/search">
              Find your first round
              <ArrowRight size={17} />
            </TransitionLink>
          </Button>
        </div>
        <div className="steps">
          {[
            {
              title: "Find your flavour",
              text: "Search a drink, a venue, or an area. Use your location to find nearby spots.",
              icon: Beer,
            },
            {
              title: "Pick your place",
              text: "Explore the map, check the drinks, and see what other visitors have to say.",
              icon: MapPin,
            },
            {
              title: "Pass on a good find",
              text: "Sign in to post a visit with your drink, a rating, and a few words.",
              icon: MessageCircle,
            },
          ].map(({ title, text, icon: Icon }, i) => (
            <div className="step" key={title}>
              <span>0{i + 1}</span>
              <div>
                <h3 className="flex items-center gap-2">
                  <Icon size={18} />
                  {title}
                </h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
