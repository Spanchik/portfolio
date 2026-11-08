import type { MetadataRoute } from "next";
import { locales, localeMeta } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return [];

  const abs = (path: string) => new URL(path, siteUrl).toString();
  const languages = Object.fromEntries(locales.map((l) => [localeMeta[l].htmlLang, abs(`/${l}`)]));

  return locales.map((lang) => ({
    url: abs(`/${lang}`),
    alternates: { languages },
  }));
}
