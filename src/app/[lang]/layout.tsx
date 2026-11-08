import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Golos_Text, Unbounded } from "next/font/google";
import { TopBar } from "@/components/layout/TopBar";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hasLocale, localeMeta, locales, defaultLocale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/site-url";
import { site } from "@/lib/site";
import "../globals.css";

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700", "800"],
  variable: "--font-unbounded",
  display: "swap",
});

const sans = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-golos",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#1F3BFF",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};

  const dict = getDictionary(lang);
  const siteUrl = getSiteUrl();
  const name = site.name[lang];
  const siteName = name || dict.meta.title;

  const metadata: Metadata = {
    title: { default: name ? `${name} — ${dict.meta.title}` : dict.meta.title, template: `%s — ${siteName}` },
    description: dict.meta.description,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: localeMeta[lang].ogLocale,
      alternateLocale: locales.filter((l) => l !== lang).map((l) => localeMeta[l].ogLocale),
      siteName,
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };

  // URL-dependent fields only when NEXT_PUBLIC_SITE_URL is valid — never a localhost fallback.
  if (siteUrl) {
    metadata.metadataBase = siteUrl;
    metadata.alternates = {
      canonical: `/${lang}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [localeMeta[l].htmlLang, `/${l}`])),
        "x-default": `/${defaultLocale}`,
      },
    };
    metadata.openGraph = { ...metadata.openGraph, url: `/${lang}` };
  }

  return metadata;
}

function PersonJsonLd({ lang }: { lang: keyof typeof site.name }) {
  const name = site.name[lang];
  if (!name) return null;

  const siteUrl = getSiteUrl();
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: "AI Solutions & Business Process Automation",
  };
  if (siteUrl) data.url = new URL(`/${lang}`, siteUrl).toString();
  if (site.sameAs.length) data.sameAs = site.sameAs;

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped so it cannot close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <html lang={localeMeta[lang].htmlLang} className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-bg text-fg">
        <PersonJsonLd lang={lang} />
        <TopBar lang={lang} dict={dict} />
        {children}
      </body>
    </html>
  );
}
