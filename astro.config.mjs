import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

// Preserve canonical article URLs for the domain cutover.
const SITE_URL = "https://aaronjosephhall.com";

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "ignore",
  // Server output + adapter enable the /api/speaking-request serverless
  // endpoint. Every page is still statically prerendered at build time
  // (see `export const prerender = true` in each page) — only that one
  // API route runs per-request.
  output: "server",
  session: false,
  adapter: vercel(),
  integrations: [mdx(), sitemap({ filter: (page) => !new URL(page).pathname.startsWith("/api/") && !new URL(page).pathname.startsWith("/404") })],
  vite: {
    plugins: [tailwindcss()],
  },
});
