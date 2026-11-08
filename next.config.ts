import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents/partialPrefetching are intentionally off: the site is two
  // fully static locales, and `dynamicParams = false` (used to 404 unknown
  // locales) is incompatible with cacheComponents.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [{ source: "/", destination: "/uk", permanent: false }];
  },
};

export default nextConfig;
