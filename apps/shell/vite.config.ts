import { defineConfig } from "vite";

// Static build. `base: "./"` keeps asset URLs relative so the output works when
// served from /experience/ (see scripts/build-shell.mjs).
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    sourcemap: false,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 700,
  },
  server: {
    // For local work on the shell alone: proxy the desktop page from the Next
    // dev server (run `npm run dev` at the repo root first).
    proxy: {
      "/desktop": "http://localhost:3000",
      "/_next": "http://localhost:3000",
    },
  },
});
