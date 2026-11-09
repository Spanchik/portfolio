import Link from "next/link";
import { cn } from "@/lib/cn";
import { locales, localeMeta, type Locale } from "@/lib/i18n/config";

export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  return (
    <nav aria-label={label} className="flex items-center gap-1 text-[13px] font-semibold">
      {locales.map((l) => {
        const active = l === lang;
        return (
          <Link
            key={l}
            href={`/${l}`}
            hrefLang={localeMeta[l].htmlLang}
            lang={localeMeta[l].htmlLang}
            aria-current={active ? "page" : undefined}
            // keep the reading position and let <ViewTransition> animate the text swap
            scroll={false}
            transitionTypes={["lang-switch"]}
            className={cn(
              "inline-flex h-10 min-w-12 items-center justify-center rounded-full border-[1.5px] px-3",
              active ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg",
            )}
          >
            {localeMeta[l].label}
          </Link>
        );
      })}
    </nav>
  );
}
