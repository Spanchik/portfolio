import type { Locale } from "./i18n/config";

/**
 * Single source of personal data. Empty values are never rendered
 * (no invented names, contacts or links).
 */
export type SiteConfig = {
  /** Display name per locale. */
  name: Record<Locale, string>;
  contacts: {
    email: string;
    /** Telegram username without "@". Empty → not shown. */
    telegram: string;
    github: string;
  };
  /** Hero portrait in /public. null → placeholder frame. */
  portrait: { src: string; file: string; width: number; height: number } | null;
};

export const site: SiteConfig = {
  name: { uk: "Ілля Соколовський", en: "Ilya Sokolovskyi" },
  contacts: {
    email: "ilyasokolovskiy64@gmail.com",
    telegram: "",
    github: "https://github.com/Spanchik",
  },
  portrait: { src: "/images/portrait.jpg", file: "portrait.jpg", width: 960, height: 1200 },
};

/** Primary "write to me" link: Telegram if set, otherwise e-mail. */
export const primaryContactHref = () =>
  site.contacts.telegram ? `https://t.me/${site.contacts.telegram}` : `mailto:${site.contacts.email}`;

/** Public profiles for JSON-LD `sameAs`. */
export const sameAs = () =>
  [site.contacts.github, site.contacts.telegram && `https://t.me/${site.contacts.telegram}`].filter(Boolean) as string[];
