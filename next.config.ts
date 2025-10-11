// cspell:ignore hrana
import type { NextConfig } from "next";
import "./src/env.ts";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  },
  turbopack: {
    resolveAlias: {
      "./node_modules/@libsql/hrana-client/LICENSE": "data:text/javascript,",
    },
  },
};

export default nextConfig;
