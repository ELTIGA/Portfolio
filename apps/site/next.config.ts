import type { NextConfig } from "next";

// The desktop experience is iframed same-origin by the 3D shell, so framing is
// limited to 'self'. 'unsafe-inline' for scripts is required by Next's inline
// bootstrap until a nonce-based CSP is added. React needs 'unsafe-eval' in
// development only (debug stack reconstruction); production never gets it.
const dev = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@portfolio/content"],
  // Sitemap paths left behind by the domain's previous WordPress site, still requested by
  // crawlers, point at the current sitemap instead of a 404.
  async redirects() {
    return ["/sitemap_index.xml", "/wp-sitemap.xml", "/page-sitemap.xml", "/post-sitemap.xml"].map((source) => ({
      source,
      destination: "/sitemap.xml",
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // No "preload" until the domain is final: preloading pins every subdomain to HTTPS.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
