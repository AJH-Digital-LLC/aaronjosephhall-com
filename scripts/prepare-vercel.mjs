import { copyFile, readdir } from 'node:fs/promises';
const directory = new URL('../.vercel/output/static/', import.meta.url);
const parts = (await readdir(directory)).filter(name => /^sitemap-\d+\.xml$/.test(name));
if (!parts.length) throw new Error('The generated sitemap is missing.');
await copyFile(new URL(parts.length === 1 ? parts[0] : 'sitemap-index.xml', directory), new URL('sitemap.xml', directory));
