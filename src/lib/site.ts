import type { Locale } from "./i18n/config";

/**
 * Single source of personal data. Every field is optional on purpose:
 * empty values are never rendered (no invented names, contacts or links).
 */
export type SiteConfig = {
  /** Display name per locale. Empty → TopBar shows only the role, no JSON-LD. */
  name: Record<Locale, string>;
  /** Primary contact for the hero CTA (mailto:, https://t.me/…, …). Empty → CTA hidden. */
  contactHref: string;
  /** Public profiles for JSON-LD `sameAs`. */
  sameAs: string[];
  /** Hero portrait in /public. null → placeholder frame. */
  portrait: { src: string; file: string; width: number; height: number } | null;
};

export const site: SiteConfig = {
  name: { uk: "", en: "" },
  contactHref: "",
  sameAs: [],
  portrait: { src: "/images/portrait.jpg", file: "portrait.jpg", width: 960, height: 1200 },
};
