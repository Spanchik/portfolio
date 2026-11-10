import { ArrowUp } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import type { Locale } from "@/lib/i18n/config";
import { site } from "@/lib/site";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-fg/15 bg-ink">
      <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-3 px-4 py-6 sm:flex-row sm:items-center sm:gap-4 text-[13px] font-semibold md:px-8">
        <p>
          © {year} {site.name[lang]}
        </p>
        <nav className="-ml-3 flex flex-wrap items-center gap-x-1 gap-y-2 sm:ml-0 sm:gap-x-2">
          <a href={`mailto:${site.contacts.email}`} className="inline-flex h-10 items-center rounded-full px-3 text-muted hover:text-fg">
            Email
          </a>
          {site.contacts.telegram && (
            <a
              href={`https://t.me/${site.contacts.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-full px-3 text-muted hover:text-fg"
            >
              Telegram
            </a>
          )}
          {site.contacts.github && (
            <a href={site.contacts.github} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full px-3 text-muted hover:text-fg">
              GitHub
            </a>
          )}
          <a
            href="#hero"
            className="ml-3 inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-[1.5px] border-fg/60 px-4 whitespace-nowrap hover:border-fg sm:ml-2"
          >
            {dict.footer.top}
            <ArrowUp size={14} strokeWidth={2.2} />
          </a>
        </nav>
      </div>
    </footer>
  );
}
