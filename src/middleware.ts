import { auth } from "@/lib/auth";

// Keep this export explicit so Turbopack picks up the Node runtime below.
export default auth;

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|webp)$).*)",
  ],
};
