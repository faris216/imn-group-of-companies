import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // NOTE: no X-Frame-Options / frame-ancestors block — the deployment preview
  // environment embeds the app in an iframe. Add frame protection together with
  // the production domain (see docs/DEPLOYMENT.md).
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3"],
  poweredByHeader: false,
  // Admin uploads travel through Server Actions; raise the framework body cap
  // (default 1 MB) so it matches the app-level 8 MB validation in actions/upload.ts.
  // NOTE: Next 15.5 reads this from `experimental.serverActions` at runtime.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920],
  },
};

export default nextConfig;
