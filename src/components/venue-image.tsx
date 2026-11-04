"use client";

import { useState } from "react";
import { Beer } from "lucide-react";
import Image from "next/image";

export function VenueImage({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed || !(/^https?:\/\//.test(src) || /^\/(?!\/)/.test(src)))
    return (
      <Beer
        className="venue-fallback"
        size={80}
        strokeWidth={1.2}
        aria-hidden="true"
      />
    );
  // Venue photos come from community data and can use hosts beyond the auth providers.
  return (
    <Image
      src={src}
      alt={name}
      width={800}
      height={430}
      unoptimized
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
