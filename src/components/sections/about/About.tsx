"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import { site } from "@/lib/site";
import { usePrefersReducedMotion } from "../hero/useStreamControls";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** "About me" — light section (alternates with the blue hero): colour portrait + statement. */
export function About({ dict, lang }: { dict: Dictionary; lang: "uk" | "en" }) {
  const reduced = usePrefersReducedMotion();
  const p = site.portrait;
  const name = site.name[lang];

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.3 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="paper-grid relative scroll-mt-16 overflow-hidden bg-paper text-ink selection:bg-bg selection:text-fg"
    >
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-12 px-4 py-20 md:px-8 md:py-32 lg:grid-cols-12 lg:gap-10">
        <motion.div {...reveal()} className="relative mx-auto w-full max-w-[460px] lg:col-span-5">
          {/* offset "extrusion", echoing the isometric blocks */}
          <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 bg-bg" />
          <div className="relative aspect-[4/5] overflow-hidden border-[1.5px] border-ink bg-ink">
            {p && (
              <Image
                src={p.src}
                alt={dict.hero.portraitAlt}
                fill
                sizes="(min-width: 1024px) 460px, 90vw"
                className="object-cover object-top"
              />
            )}
          </div>
        </motion.div>

        <div className="flex flex-col gap-8 lg:col-span-6 lg:col-start-7">
          <motion.h2
            {...reveal(0.1)}
            id="about-title"
            className="font-display text-4xl font-bold tracking-[-0.02em] md:text-6xl"
          >
            {dict.about.title}
            {name && <span className="block text-bg">{name}</span>}
          </motion.h2>

          <motion.p {...reveal(0.2)} className="max-w-[42ch] text-lg leading-relaxed text-ink/85 md:text-[1.35rem] md:leading-[1.55]">
            {dict.about.text}
          </motion.p>
        </div>

        {/* what I take on: three cards, extruded like the isometric blocks */}
        <div className="lg:col-span-12">
          <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-bg uppercase before:size-1.5 before:rotate-45 before:bg-current">
            {dict.about.servicesLabel}
          </h3>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {dict.about.services.map((s, i) => (
              <motion.li
                key={s.t}
                initial={reduced ? false : { opacity: 0, x: 8, y: 8, boxShadow: "0px 0px 0px 0px #1f3bff" }}
                whileInView={{ opacity: 1, x: 0, y: 0, boxShadow: "7px 7px 0px 0px #1f3bff" }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: EASE }}
                style={reduced ? { boxShadow: "7px 7px 0px 0px #1f3bff" } : undefined}
                className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-ink bg-white p-6"
              >
                <span className="font-display text-sm font-bold text-bg">0{i + 1}</span>
                <b className="font-display text-lg leading-snug font-medium tracking-[-0.01em] md:text-xl">{s.t}</b>
                <span className="leading-relaxed text-ink/75">{s.d}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
