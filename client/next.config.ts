import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // In production, the API lives on a separate Vercel project/domain.
  // Proxying "/api/*" through this app's own domain makes every request
  // same-origin from the browser's point of view, which avoids cross-site
  // cookie restrictions (Safari's ITP in particular blocks the auth cookie
  // otherwise, even with SameSite=None). Locally, API_ORIGIN is unset and
  // the client talks directly to the Express server instead.
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN;

    if (!apiOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
