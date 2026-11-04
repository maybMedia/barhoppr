"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Beer,
  ChevronDown,
  Compass,
  Info,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransitionLink } from "@/components/page-transition";
import { useTheme } from "@/components/theme-provider";
import { BrandMark } from "@/components/brand-mark";

const links = [
  { href: "/map", label: "Explore the map", icon: Compass },
  { href: "/search", label: "Find a drink", icon: Search },
  { href: "/about", label: "Our story", icon: Info },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <nav className="page-width navbar" aria-label="Main navigation">
        <TransitionLink href="/" className="brand" onClick={close}>
          <span className="brand-icon">
            <BrandMark />
          </span>
          BarHoppr<span className="brand-dot">.</span>
        </TransitionLink>
        <div className="desktop-links">
          {links.map(({ href, label }) => (
            <TransitionLink
              key={href}
              href={href}
              className={pathname === href ? "nav-link active" : "nav-link"}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </TransitionLink>
          ))}
        </div>
        <div className="nav-actions">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Change colour theme"
                className="theme-toggle"
              >
                <Sun className="dark:hidden" size={19} />
                <Moon className="hidden dark:block" size={19} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(
                [
                  { value: "light", icon: Sun, label: "Light" },
                  { value: "dark", icon: Moon, label: "Dark" },
                  { value: "system", icon: Monitor, label: "Match my device" },
                ] as const
              ).map(({ value, icon: Icon, label }) => (
                <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
                  <Icon size={16} />
                  {label}
                  <span className="ml-auto">{theme === value ? "✓" : ""}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="profile-button">
                  <UserRound size={17} />
                  <span>
                    {session.user?.name?.split(" ")[0] || "Your account"}
                  </span>
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <TransitionLink href="/map">
                    <Beer size={16} />
                    Share a visit
                  </TransitionLink>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut size={16} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="desktop-signin">
              <TransitionLink href="/logIn">
                {status === "loading" ? "Welcome" : "Join the round"}
                <UserRound size={15} />
              </TransitionLink>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {links.map(({ href, label, icon: Icon }) => (
            <TransitionLink
              key={href}
              href={href}
              onClick={close}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={20} />
              {label}
            </TransitionLink>
          ))}
          {!session && (
            <TransitionLink href="/logIn" onClick={close}>
              <UserRound size={20} />
              Join the round
            </TransitionLink>
          )}
        </nav>
      )}
    </header>
  );
}
