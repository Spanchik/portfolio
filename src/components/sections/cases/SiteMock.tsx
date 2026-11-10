"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, GitBranch, Globe, Loader } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CasesDict } from "@/lib/i18n/dictionaries/cases.uk";
import { useInView, usePrefersReducedMotion } from "../hero/useStreamControls";

type Site = CasesDict["mock"]["site"];

/**
 * Portfolio case mock-up: a release checklist of this site. Checks tick off one by one,
 * then the deployment turns "ready". Deliberately not a picture of the site itself —
 * the real thing is the page the visitor is already on.
 */
export function SiteMock({ dict }: { dict: Site }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, 0.3);
  const total = dict.checks.length;
  const [frame, setFrame] = useState(0);
  // frames 0…total: that many checks are done; the last frame is held longer
  const done = reduced ? total : Math.min(frame, total);
  const ready = done === total;

  useEffect(() => {
    if (reduced || !inView) return;
    const t = window.setTimeout(() => setFrame((f) => (f >= total ? 0 : f + 1)), frame >= total ? 4200 : 900);
    return () => window.clearTimeout(t);
  }, [frame, reduced, inView, total]);

  return (
    <div ref={ref} role="img" aria-label={dict.label} className="relative mx-auto w-full max-w-[720px]">
      <div aria-hidden>
        <div className="overflow-hidden rounded-2xl border-[1.5px] border-ink bg-white text-ink shadow-[12px_12px_0_var(--color-bg)]">
          <div className="flex items-center gap-2 border-b-[1.5px] border-ink bg-paper px-4 py-2.5">
            <span className="size-2.5 rounded-full border border-ink bg-accent" />
            <span className="size-2.5 rounded-full border border-ink" />
            <span className="size-2.5 rounded-full border border-ink" />
            <span className="ml-3 truncate rounded-full border-[1.5px] border-ink/25 bg-white px-3 py-0.5 text-[12.5px] font-medium text-ink/60">{dict.url}</span>
          </div>

          <div className="flex flex-col gap-3 p-3 sm:p-4">
            {/* deployment header */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-[1.5px] border-ink px-3 py-2.5">
              <p className="flex min-w-0 items-center gap-2 text-[13px] font-semibold">
                <GitBranch size={15} strokeWidth={2.2} className="shrink-0" />
                <span className="truncate">{dict.branch}</span>
              </p>
              <p
                className={cn(
                  "flex items-center gap-1.5 rounded-full border-[1.5px] border-ink px-2.5 py-1 text-[12.5px] font-bold transition-colors duration-300",
                  ready ? "bg-accent" : "bg-paper",
                )}
              >
                {ready ? (
                  <Check size={13} strokeWidth={3} />
                ) : (
                  <Loader size={13} strokeWidth={2.6} className={cn(!reduced && "animate-[spin_1.4s_linear_infinite]")} />
                )}
                {ready ? dict.ready : dict.building}
              </p>
            </div>

            {/* checklist */}
            <ul className="rounded-xl border-[1.5px] border-ink">
              {dict.checks.map((c, i) => {
                const ok = i < done;
                return (
                  <li key={c.t} className={cn("flex items-center gap-3 px-3 py-2.5", i > 0 && "border-t border-ink/15")}>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink transition-colors duration-300",
                        ok ? "bg-bg text-fg" : "bg-paper",
                      )}
                    >
                      {ok && <Check size={11} strokeWidth={3.5} />}
                    </span>
                    <span className="flex min-w-0 flex-col leading-tight sm:flex-row sm:items-baseline sm:gap-2">
                      <b className={cn("text-[13px] transition-colors duration-300", !ok && "text-ink/45")}>{c.t}</b>
                      <span className="truncate text-[12.5px] text-ink/60">{c.d}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* "live" toast once every check is green */}
        <AnimatePresence>
          {ready && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-5 right-2 z-10 flex rotate-2 items-center gap-2 rounded-full border-[1.5px] border-ink bg-accent px-3.5 py-2 text-[13px] font-bold text-ink shadow-[4px_4px_0_var(--color-ink)] sm:-right-4"
            >
              <Globe size={14} strokeWidth={2.4} />
              {dict.toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
