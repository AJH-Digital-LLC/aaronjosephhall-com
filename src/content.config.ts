import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Preserved verbatim from the existing live site's article archive.
// Do not add/remove/rename categories without confirming with the site owner.
export const ARTICLE_CATEGORIES = [
  "Christian Life",
  "Church",
  "Church & Ministry",
  "Communication",
  "Culture",
  "Devotionals",
  "Discipleship",
  "Faith",
  "Faith & Work",
  "Leadership",
  "Ministry",
  "Personal Growth",
  "Purpose & Calling",
  "Writing",
] as const;

const articles = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/articles" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Set true when the owner identifies a timeless post; hide visible dates only.
      evergreen: z.boolean().default(false),
      // Optional: the migration inventory did not include verified publish
      // dates for every article. Never fill this with a guessed date —
      // leave it unset (the archive will show "Date pending") until the
      // real date is confirmed.
      date: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      // Optional for the same reason as `date`: the inventory confirmed the
      // *set* of categories in use archive-wide, not which category each of
      // the four verified articles individually belongs to. Leave unset
      // rather than guess from the title.
      category: z.enum(ARTICLE_CATEGORIES).optional(),
      excerpt: z.string(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      author: z.string().default("Aaron Joseph Hall"),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      draft: z.boolean().default(false),
      // True while this entry only carries verified metadata (title/date/
      // category/URL) and is still waiting on the original body copy from
      // aaronjosephhall.com. Never set to false by rewriting/inventing the
      // body — only once the real text has been pasted in verbatim.
      contentPending: z.boolean().default(false),
      // True when the body below was drafted by Claude as a placeholder
      // (explicitly requested), not migrated from the live site. Always
      // pair with contentPending: true — an AI draft is still not the
      // real, final copy.
      aiDraft: z.boolean().default(false),
    }).refine((article) => !article.image || Boolean(article.imageAlt?.trim()), {
      message: "Featured article images require descriptive imageAlt text.",
      path: ["imageAlt"],
    }),
});

const speaking = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/speaking" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      // Optional short tag shown alongside the title, e.g. "Leadership".
      category: z.string().optional(),
      order: z.number().default(99),
      excerpt: z.string(),
      image: image().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      contentPending: z.boolean().default(false),
    }),
});

const books = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/books" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    isbn10: z.string().optional(),
    isbn13: z.string().optional(),
    pageCount: z.number().optional(),
    language: z.string().optional(),
    dimensions: z.string().optional(),
    publisher: z.string().optional(),
    publishDate: z.coerce.date().optional(),
    // A path into public/ (e.g. "/Some Cover.jpg"), like the site's other
    // owner-uploaded photos — not a local src/ asset, so plain string
    // rather than the image() schema helper.
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    purchaseLinks: z
      .array(z.object({ label: z.string(), url: z.string().url() }))
      .default([]),
    excerpt: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    order: z.number().default(99),
    contentPending: z.boolean().default(false),
  }),
});

export const collections = { articles, speaking, books };
