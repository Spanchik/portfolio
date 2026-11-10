import { Plus } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";

/** Frequently asked questions: native <details>, so it works without JavaScript. */
export function Faq({ dict }: { dict: Dictionary }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="relative scroll-mt-16">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-10 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-12 lg:gap-12">
        <h2
          id="faq-title"
          className="font-display text-[clamp(1.8rem,3.9vw,3.5rem)] leading-[1.1] font-medium tracking-[-0.02em] lg:col-span-4"
        >
          {dict.faq.title}
        </h2>
        <div className="border-b border-fg/25 lg:col-span-8">
          {dict.faq.items.map((item) => (
            <details key={item.q} className="group border-t border-fg/25">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-base leading-snug font-medium tracking-[-0.01em] md:text-xl [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-fg/60 transition-transform duration-200 group-open:rotate-45">
                  <Plus size={18} strokeWidth={2.2} />
                </span>
              </summary>
              <p className="max-w-[62ch] pb-6 leading-relaxed text-fg/90 md:text-lg">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
