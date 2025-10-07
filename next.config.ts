import type { NextConfig } from "next";
import "./src/env.ts";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
  }
};

export default nextConfig;
