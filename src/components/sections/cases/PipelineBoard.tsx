"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Check, GraduationCap, RefreshCw, TrendingUp, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CasesDict } from "@/lib/i18n/dictionaries/cases.uk";
import { useInView, usePrefersReducedMotion } from "../hero/useStreamControls";

type Board = CasesDict["mock"]["board"];

/** Column index of each card, frame by frame; loops. */
const FRAMES = [
  [0, 0, 1, 1, 2],
  [0, 0, 1, 1, 3],
  [0, 0, 1, 2, 3],
  [0, 1, 1, 2, 3],
  [0, 1, 2, 2, 3],
  [0, 1, 2, 3, 3],
  [1, 1, 2, 3, 3],
];
const NAV_ICONS = [Users, UserPlus, TrendingUp, GraduationCap, RefreshCw];
const BARS = [0.4, 0.55, 0.5, 0.75, 0.65, 0.95];

const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").replace(".", "");

/** HR Platform dashboard mock-up: nav, KPIs, self-advancing pipeline, chart, 1C sync toast (fictional data). */
export function PipelineBoard({ dict }: { dict: Board }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, 0.3);
  const [frame, setFrame] = useState(0);
  const cols = FRAMES[reduced ? FRAMES.length - 2 : frame];
  const last = dict.columns.length - 1;
  const hired = cols.filter((c) => c === last).length;

  useEffect(() => {
    if (reduced || !inView) return;
    const t = window.setTimeout(() => setFrame((f) => (f + 1) % FRAMES.length), frame === FRAMES.length - 1 ? 3200 : 1500);
    return () => window.clearTimeout(t);
  }, [frame, reduced, inView]);

  return (
    <div ref={ref} role="img" aria-label={dict.label} className="relative mx-auto w-full max-w-[720px]">
      <div aria-hidden>
        <div className="overflow-hidden rounded-2xl border-[1.5px] border-ink bg-white text-ink shadow-[12px_12px_0_var(--color-bg)]">
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b-[1.5px] border-ink bg-paper px-4 py-2.5">
            <span className="size-2.5 rounded-full border border-ink bg-accent" />
            <span className="size-2.5 rounded-full border border-ink" />
            <span className="size-2.5 rounded-full border border-ink" />
            <span className="ml-3 truncate rounded-full border-[1.5px] border-ink/25 bg-white px-3 py-0.5 text-[11px] font-medium text-ink/60">{dict.url}</span>
          </div>

          <div className="flex">
            {/* sidebar */}
            <ul className="flex w-11 shrink-0 flex-col gap-1 border-r-[1.5px] border-ink bg-paper p-1.5 sm:w-36 sm:p-2">
              {dict.nav.map((n, i) => {
                const Icon = NAV_ICONS[i];
                return (
                  <li
                    key={n}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-semibold",
                      i === 0 ? "border-[1.5px] border-ink bg-bg text-fg" : "text-ink/70",
                    )}
                  >
                    <Icon size={14} strokeWidth={2.2} className="shrink-0" />
                    <span className="hidden truncate sm:inline">{n}</span>
                  </li>
                );
              })}
            </ul>

            <div className="flex min-w-0 flex-1 flex-col gap-3 p-3">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-2">
                {dict.kpis.map((k, i) => (
                  <p key={k.label} className={cn("rounded-xl border-[1.5px] border-ink px-2.5 py-2 leading-tight", i === 2 && "bg-accent")}>
                    <span className="block truncate text-[10px] font-semibold text-ink/65">{k.label}</span>
                    <b className="font-display text-base sm:text-lg">{k.value}</b>
                  </p>
                ))}
              </div>

              {/* pipeline */}
              <LayoutGroup>
                <div className="grid min-h-[210px] grid-cols-4 gap-1.5">
                  {dict.columns.map((title, c) => (
                    <div key={title} className="flex min-w-0 flex-col gap-1.5 rounded-xl bg-paper p-1.5">
                      <p className="flex items-center justify-between gap-1 px-0.5 font-display text-[8px] font-bold tracking-[0.04em] uppercase sm:text-[9px]">
                        <span className="truncate">{title}</span>
                        <span className="text-ink/45">{cols.filter((x) => x === c).length}</span>
                      </p>
                      {dict.cards.map((card, i) =>
                        cols[i] === c ? (
                          <motion.div
                            key={card.name}
                            layoutId={`card-${i}`}
                            transition={{ type: "spring", stiffness: 260, damping: 26 }}
                            className="flex flex-col gap-1 rounded-lg border-[1.5px] border-ink bg-white p-1.5"
                          >
                            <span className="flex items-center gap-1">
                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-bg text-[8px] font-bold text-fg">
                                {initials(card.name)}
                              </span>
                              <b className="truncate text-[10px]">{card.name}</b>
                            </span>
                            <span className="truncate text-[9px] text-ink/60">{card.role}</span>
                            {c === last && (
                              <span className="flex w-fit items-center gap-0.5 rounded-full border border-ink bg-accent px-1.5 text-[9px] font-bold">
                                <Check size={9} strokeWidth={3.5} />
                                {dict.synced}
                              </span>
                            )}
                          </motion.div>
                        ) : null,
                      )}
                    </div>
                  ))}
                </div>
              </LayoutGroup>

              {/* chart */}
              <div className="rounded-xl border-[1.5px] border-ink p-2.5">
                <p className="mb-2 font-display text-[9px] font-bold tracking-[0.04em] uppercase">{dict.chart}</p>
                <div className="flex h-14 items-end gap-2">
                  {BARS.map((h, i) => (
                    <motion.span
                      key={i}
                      className={cn("flex-1 origin-bottom rounded-t border-[1.5px] border-ink", i === BARS.length - 1 ? "bg-accent" : "bg-bg")}
                      style={{ height: `${h * 100}%` }}
                      initial={{ scaleY: reduced ? 1 : 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1C sync toast — pops each time a candidate is hired */}
        <AnimatePresence>
          {hired > 0 && (
            <motion.p
              key={hired}
              initial={reduced ? false : { opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-5 right-2 z-10 flex rotate-2 items-center gap-2 rounded-full border-[1.5px] border-ink bg-accent px-3.5 py-2 text-xs font-bold text-ink shadow-[4px_4px_0_var(--color-ink)] sm:-right-4"
            >
              <Check size={14} strokeWidth={3} />
              {dict.toast}
            </motion.p>
          )}
        </AnimatePresence>

        {/* LMS / onboarding card */}
        <div className="absolute -bottom-8 -left-3 z-10 hidden w-[180px] -rotate-3 sm:block">
          <div className="animate-[float_6s_ease-in-out_infinite] rounded-2xl border-[1.5px] border-ink bg-white p-3 text-ink shadow-[6px_6px_0_var(--color-ink)]">
            <p className="flex items-center gap-1.5 font-display text-[10px] font-bold tracking-[0.04em] uppercase">
              <GraduationCap size={14} strokeWidth={2.2} />
              {dict.lms.title}
            </p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full border-[1.5px] border-ink">
              <motion.div
                className="h-full origin-left bg-bg"
                style={{ width: "60%" }}
                initial={{ scaleX: reduced ? 1 : 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.6 }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-ink/60">{dict.lms.progress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
