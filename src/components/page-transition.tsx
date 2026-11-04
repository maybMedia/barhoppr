"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";

const NavigationContext = createContext<(href: string) => void>(() => {});

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "fill" | "drain">("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const navigating = useRef(false);
  const previousPath = useRef(pathname);
  const schedule = useCallback((fn: () => void, delay: number) => {
    timers.current.push(setTimeout(fn, delay));
  }, []);
  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("drain");
    schedule(() => {
      setPhase("idle");
      navigating.current = false;
    }, 540);
  }, [schedule]);
  const navigate = useCallback(
    (href: string) => {
      if (navigating.current) return;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        href.split(/[?#]/)[0] === pathname
      ) {
        router.push(href);
        return;
      }
      navigating.current = true;
      setPhase("fill");
      schedule(() => router.push(href), 490);
      schedule(() => {
        if (navigating.current) finish();
      }, 4000);
    },
    [finish, pathname, router, schedule],
  );
  useEffect(() => {
    if (previousPath.current !== pathname && navigating.current)
      schedule(finish, 160);
    previousPath.current = pathname;
  }, [finish, pathname, schedule]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (
    <NavigationContext.Provider value={navigate}>
      {children}
      <div
        className={`beer-transition beer-transition--${phase}`}
        aria-hidden="true"
      >
        <div className="transition-liquid">
          <div className="transition-foam" />
          <div className="transition-cheers">
            <BrandMark size={64} />
            <span>Good things on tap.</span>
          </div>
          {Array.from({ length: 12 }, (_, i) => (
            <i
              className="transition-bubble"
              key={i}
              style={{ left: `${6 + i * 8}%`, animationDelay: `${i * 0.11}s` }}
            />
          ))}
        </div>
      </div>
    </NavigationContext.Provider>
  );
}

export function TransitionLink({
  href,
  onClick,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & { href: string }) {
  const navigate = useContext(NavigationContext);
  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          event.button === 0 &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          props.target !== "_blank" &&
          href.startsWith("/") &&
          !props.download
        ) {
          event.preventDefault();
          navigate(href);
        }
      }}
    >
      {children}
    </Link>
  );
}

export function QuickSearch() {
  const navigate = useContext(NavigationContext);
  return (
    <form
      action="/search"
      className="quick-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const query = new FormData(event.currentTarget)
          .get("q")
          ?.toString()
          .trim();
        navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
      }}
    >
      <Search size={19} />
      <label htmlFor="home-drink" className="sr-only">
        Search drinks or breweries
      </label>
      <input
        id="home-drink"
        name="q"
        placeholder="What are you drinking?"
        maxLength={120}
      />
      <Button type="submit">
        Let’s find it
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}
