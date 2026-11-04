import { MapPin, Sparkles, Wheat } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export function BeerArt() {
  return (
    <div className="beer-art" aria-hidden="true">
      <div className="pint-shadow" />
      <div className="hero-coaster" />
      <div className="pint">
        <div className="pint-handle" />
        <div className="pint-glass">
          <div className="pint-beer">
            {Array.from({ length: 14 }, (_, i) => (
              <i
                key={i}
                className="pint-bubble"
                style={{
                  left: `${10 + ((i * 17) % 80)}%`,
                  animationDelay: `${i * -0.47}s`,
                  width: `${4 + (i % 4) * 2}px`,
                  height: `${4 + (i % 4) * 2}px`,
                }}
              />
            ))}
          </div>
          <div className="pint-shine" />
          <div className="pint-label">
            <BrandMark size={44} />
            <span>
              YOUR NEXT
              <br />
              LOCAL.
            </span>
            <small>GOOD TIMES ON TAP</small>
          </div>
        </div>
        <div className="pint-foam">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="hero-find-pin">
        <MapPin size={29} strokeWidth={1.5} />
        <span>
          YOUR KIND
          <br />
          OF PLACE.
        </span>
      </div>
      <div className="hero-hop">
        <Wheat size={48} strokeWidth={1.5} />
      </div>
      <div className="hero-spark">
        <Sparkles size={35} strokeWidth={1.3} />
      </div>
      <div className="hero-stamp">
        <span>LESS SCROLL.</span>
        <strong>
          MORE
          <br />
          CHEERS.
        </strong>
        <span>✦</span>
      </div>
    </div>
  );
}
