import type { NextConfig } from "next";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Proxy backend routes through Next so frontend can call /api/* without CORS hassles.
  // /api/ai/* stays local (Next route handlers) for direct Claude calls.
  async rewrites() {
    return [
      { source: "/api/auth/:path*",          destination: `${API}/api/auth/:path*` },
      { source: "/api/users/:path*",         destination: `${API}/api/users/:path*` },
      { source: "/api/opportunities/:path*", destination: `${API}/api/opportunities/:path*` },
      { source: "/api/housing/:path*",       destination: `${API}/api/housing/:path*` },
      { source: "/api/forums/:path*",        destination: `${API}/api/forums/:path*` },
      { source: "/api/messages/:path*",      destination: `${API}/api/messages/:path*` },
      { source: "/api/moderation/:path*",    destination: `${API}/api/moderation/:path*` },
      { source: "/api/content/:path*",       destination: `${API}/api/content/:path*` },
    ];
  },
};

export default nextConfig;
