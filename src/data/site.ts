// Site-wide constants. Values marked TODO are placeholders — they were not
// part of the verified migration inventory and must be confirmed by Aaron
// before this site goes live.

export const SITE = {
  name: "Aaron Joseph Hall",
  tagline: "Pastor. Husband. Father. Author. Speaker.",
  url: "https://aaronjosephhall.com",
  email: "aaron@aaronjosephhall.com",
  locale: "en-US",
};

export interface NavLink {
  label: string;
  href: string;
}

// Trimmed to the site owner's requested page set (2026-08-28): Home, About,
// Writing, Books, Speaking, Contact, Work With Me, Newsletter. Everything
// else (Leadership, Consulting, Ministry, Media) was removed rather than
// hidden — see MIGRATION.md.
export const NAV_LINKS: (NavLink & { inNav?: boolean })[] = [
  { label: "About", href: "/about" },
  { label: "Writing", href: "/articles" },
  { label: "Podcast", href: "/podcast" },
  { label: "Speaking", href: "/speaking" },
  { label: "Books", href: "/books" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Contact", href: "/contact" },
];

export const SOCIAL_LINKS: { label: string; href: string }[] = [
  { label: "Facebook", href: "https://www.facebook.com/AuthorAJH" },
  { label: "Instagram", href: "https://www.instagram.com/aaronjosephhall" },
  { label: "YouTube", href: "https://www.youtube.com/@aaronjosephhall" },
];

export const LEGAL_LINKS: NavLink[] = [
  { label: "Affiliate Disclaimer", href: "/legal/affiliate-disclaimer/" },
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Use", href: "/legal/terms-of-use" },
];
