export const locales = ["uk", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "uk";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** BCP 47 tag for <html lang> and Open Graph locale. */
export const localeMeta: Record<Locale, { htmlLang: string; ogLocale: string; label: string }> = {
  uk: { htmlLang: "uk", ogLocale: "uk_UA", label: "UK" },
  en: { htmlLang: "en", ogLocale: "en_US", label: "EN" },
};
