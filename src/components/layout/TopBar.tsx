import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import type { Locale } from "@/lib/i18n/config";
import { site } from "@/lib/site";
import { LangSwitch } from "./LangSwitch";

/** Fixed header: name, section anchors, contact CTA and the language switch. */
export function TopBar({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const name = site.name[lang];
  const link = "rounded-full px-3 py-2 text-fg/85 hover:text-fg";
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 bg-bg/85 backdrop-blur-md"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-3 px-4 md:px-8">
        <a href="#hero" className="hidden min-w-0 truncate text-[13px] font-semibold text-fg min-[440px]:block">
          {name || dict.meta.title}
        </a>
        <div className="flex grow items-center justify-end gap-1 text-[13px] font-semibold min-[440px]:grow-0">
          <nav aria-label={dict.topbar.mainNav} className="hidden items-center md:flex">
            <a href="#cases" className={link}>
              {dict.topbar.cases}
            </a>
            <a href="#about" className={link}>
              {dict.topbar.about}
            </a>
            <a href="#faq" className={link}>
              {dict.topbar.faq}
            </a>
          </nav>
          <a
            href="#contact"
            className="mr-auto inline-flex h-10 items-center min-[440px]:mx-1 rounded-full bg-fg px-4 text-bg btn-iso hover:bg-accent hover:text-ink"
          >
            {dict.topbar.contact}
          </a>
          <LangSwitch lang={lang} label={dict.topbar.langNav} />
        </div>
      </div>
    </header>
  );
}
