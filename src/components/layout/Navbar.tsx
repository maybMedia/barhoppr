"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  return (
    <nav className="w-full border-b bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-sidebar-primary">
          <Image src="/BarHoppr.png" alt="BarHoppr Logo" width={64} height={64} className="inline-block mr-2" />
          BarHoppr
        </Link>

        {/* Desktop Links */}
        <div className="hidden gap-6 md:flex">
          <Link href="/map" className="hover:text-sidebar-primary hover:bg-sidebar-accent px-2 py-1 rounded transition-all duration-200">
            Map
          </Link>
          <Link href="/reviews" className="hover:text-sidebar-primary hover:bg-sidebar-accent px-2 py-1 rounded transition-all duration-200">
            Reviews
          </Link>
          <Link href="/about" className="hover:text-sidebar-primary hover:bg-sidebar-accent px-2 py-1 rounded transition-all duration-200">
            About
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Desktop login */}
          <div className="hidden md:block">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
          </div>

          {/* Profile Dropdown (desktop only for now) */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/logout">Log out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12">
                  <Menu className="h-10 w-10" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-4">
                  <Link
                    className="border-b border-sidebar-foreground pl-4 text-accent dark:text-sidebar-accent-foreground"
                    href="/map"
                  >
                    Map
                  </Link>
                  <Link
                    className="border-b border-sidebar-foreground pl-4 text-accent dark:text-sidebar-accent-foreground"
                    href="/reviews"
                  >
                    Reviews
                  </Link>
                  <Link
                    className="border-b border-sidebar-foreground pl-4 text-accent dark:text-sidebar-accent-foreground"
                    href="/about"
                  >
                    About
                  </Link>
                  <Link
                    className="border-b border-sidebar-foreground pl-4 text-accent dark:text-sidebar-accent-foreground"
                    href="/login"
                  >
                    Log in
                  </Link>
                  <Link
                    className="border-b border-sidebar-foreground pl-4 text-accent dark:text-sidebar-accent-foreground"
                    href="/settings"
                  >
                    Settings
                  </Link>
                  <Link
                    className="border-b border-sidebar-foreground pl-4 text-accent dark:text-sidebar-accent-foreground"
                    href="/logout"
                  >
                    Log out
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
