// cspell:ignore hrana
import type { NextConfig } from "next";
import "./src/env.ts";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  // Keep libSQL's native SQLite bindings out of Turbopack's module graph.
  serverExternalPackages: ["@libsql/client", "libsql"],
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      "./node_modules/@libsql/hrana-client/LICENSE": "data:text/javascript,",
    },
  },
};

export default nextConfig;
