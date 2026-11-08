import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import type { Locale } from "@/lib/i18n/config";
import { site } from "@/lib/site";
import { LangSwitch } from "./LangSwitch";

export function TopBar({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const name = site.name[lang];
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-[72px] max-w-[1360px] items-center justify-between gap-4 px-4 md:px-8">
        <p className="flex min-w-0 items-center gap-3 text-[13px] font-semibold">
          {name && <span className="truncate text-fg">{name}</span>}
          {name && <span aria-hidden className="text-line-2">/</span>}
          <span className="truncate text-fg">{dict.meta.title}</span>
        </p>
        <LangSwitch lang={lang} label={dict.topbar.langNav} />
      </div>
    </header>
  );
}
