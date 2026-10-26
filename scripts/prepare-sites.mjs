import { copyFile, readdir, writeFile } from 'node:fs/promises';

// Sites expects this entry name; preserve Astro's generated module and chunks.
await writeFile(new URL('../dist/server/index.js', import.meta.url), 'export { default } from "./entry.mjs";\n');

// Publish the complete generated sitemap at the site's conventional URL.
// If the archive outgrows one sitemap, preserve the generator's index and limits.
const clientDirectory = new URL('../dist/client/', import.meta.url);
const sitemapParts = (await readdir(clientDirectory)).filter(name => /^sitemap-\d+\.xml$/.test(name));
if (!sitemapParts.length) throw new Error('The generated sitemap is missing.');
await copyFile(
  new URL(sitemapParts.length === 1 ? sitemapParts[0] : 'sitemap-index.xml', clientDirectory),
  new URL('sitemap.xml', clientDirectory),
);
