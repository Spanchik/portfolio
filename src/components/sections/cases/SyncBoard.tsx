"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Receipt, RefreshCw, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CasesDict } from "@/lib/i18n/dictionaries/cases.uk";
import { useInView, usePrefersReducedMotion } from "../hero/useStreamControls";

type Sync = CasesDict["mock"]["sync"];

/** Loop: 0 idle → 1 stock arrives (row switches on) → 2 order comes in → 3 receipt created. */
const FRAMES = 4;

/** Delivery sync mock-up: store catalogue with live stock + an incoming order turning into a receipt (fictional data). */
export function SyncBoard({ dict }: { dict: Sync }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, 0.3);
  const [frame, setFrame] = useState(0);
  const f = reduced ? FRAMES - 1 : frame;

  useEffect(() => {
    if (reduced || !inView) return;
    const t = window.setTimeout(() => setFrame((x) => (x + 1) % FRAMES), frame === FRAMES - 1 ? 3400 : 1700);
    return () => window.clearTimeout(t);
  }, [frame, reduced, inView]);

  return (
    <div ref={ref} role="img" aria-label={dict.label} className="relative mx-auto w-full max-w-[720px]">
      <div aria-hidden>
        <div className="overflow-hidden rounded-2xl border-[1.5px] border-ink bg-white text-ink shadow-[12px_12px_0_var(--color-ink)]">
          {/* browser chrome */}
          <div className="flex items-center gap-2 border-b-[1.5px] border-ink bg-paper px-4 py-2.5">
            <span className="size-2.5 rounded-full border border-ink bg-accent" />
            <span className="size-2.5 rounded-full border border-ink" />
            <span className="size-2.5 rounded-full border border-ink" />
            <span className="ml-3 truncate rounded-full border-[1.5px] border-ink/25 bg-white px-3 py-0.5 text-[12.5px] font-medium text-ink/60">{dict.url}</span>
          </div>

          <div className="flex flex-col gap-3 p-3 sm:pb-12">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2">
              {dict.kpis.map((k, i) => (
                <p key={k.label} className={cn("rounded-xl border-[1.5px] border-ink px-2.5 py-2 leading-tight", i === 2 && "bg-accent")}>
                  <span className="block truncate text-[11.5px] font-semibold text-ink/65">{k.label}</span>
                  <b className="font-display text-base sm:text-lg">{k.value}</b>
                </p>
              ))}
            </div>

            {/* catalogue */}
            <div className="rounded-xl border-[1.5px] border-ink">
              <p className="grid grid-cols-[1fr_4.2rem_3.7rem] gap-2 border-b-[1.5px] border-ink bg-paper px-3 py-2 text-[10.5px] font-semibold text-ink/65 uppercase sm:grid-cols-[1fr_5rem_4.5rem_5rem] sm:text-[11.5px] sm:tracking-[0.06em]">
                {dict.columns.map((c, i) => (
                  <span key={c} className={cn("truncate", i > 0 && "text-right", i === 1 && "hidden sm:block")}>
                    {c}
                  </span>
                ))}
              </p>
              {dict.rows.map((r, i) => {
                // the out-of-stock row gets a delivery on frame 1 and goes live on the storefront
                const restock = r.stock === "0";
                const live = restock ? f >= 1 : true;
                return (
                  <p
                    key={r.name}
                    className={cn(
                      "grid grid-cols-[1fr_4.2rem_3.7rem] items-center gap-2 px-3 py-2 text-xs sm:grid-cols-[1fr_5rem_4.5rem_5rem] sm:text-[13px]",
                      i > 0 && "border-t border-ink/15",
                    )}
                  >
                    <b className="truncate font-semibold">{r.name}</b>
                    <span className="hidden text-right tabular-nums sm:block">{r.price}</span>
                    <span className={cn("text-right tabular-nums", !live && "text-ink/45")}>{restock && live ? dict.restock : r.stock}</span>
                    <span className="flex justify-end">
                      <span
                        className={cn(
                          "relative h-4 w-8 rounded-full border-[1.5px] border-ink transition-colors duration-300",
                          live ? "bg-bg" : "bg-paper",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border border-ink bg-white transition-[left] duration-300",
                            live ? "left-[15px]" : "left-0.5",
                          )}
                        />
                      </span>
                    </span>
                  </p>
                );
              })}
            </div>

            {/* last sync line */}
            <p className="flex items-center gap-2 px-1 text-[12.5px] font-medium text-ink/60">
              <RefreshCw size={12} strokeWidth={2.4} className={cn(!reduced && inView && "animate-[spin_3s_linear_infinite]")} />
              {dict.synced}
            </p>
          </div>
        </div>

        {/* catalogue toast — when the restocked item goes live */}
        <AnimatePresence>
          {f === 1 && (
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-5 right-2 z-10 flex rotate-2 items-center gap-2 rounded-full border-[1.5px] border-ink bg-accent px-3.5 py-2 text-[13px] font-bold text-ink shadow-[4px_4px_0_var(--color-ink)] sm:-right-4"
            >
              <Check size={14} strokeWidth={3} />
              {dict.toast}
            </motion.p>
          )}
        </AnimatePresence>

        {/* incoming order → receipt */}
        <AnimatePresence>
          {f >= 2 && (
            <motion.div
              initial={reduced ? false : { opacity: 0, x: 10, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute -right-3 -bottom-9 z-10 hidden w-[226px] rotate-2 rounded-2xl border-[1.5px] border-ink bg-white p-3 text-ink shadow-[6px_6px_0_var(--color-accent)] sm:block"
            >
              <p className="flex items-center gap-1.5 font-display text-[11.5px] font-bold tracking-[0.04em] uppercase">
                <ShoppingBag size={14} strokeWidth={2.2} />
                {dict.order.title}
              </p>
              <p className="mt-1 text-[12.5px] text-ink/60">{dict.order.meta}</p>
              <p
                className={cn(
                  "mt-2 flex w-fit items-center gap-1.5 rounded-full border-[1.5px] border-ink px-2.5 py-1 text-[12.5px] font-bold transition-colors duration-300",
                  f >= 3 ? "bg-accent" : "bg-paper",
                )}
              >
                {f >= 3 ? <Receipt size={12} strokeWidth={2.4} /> : <RefreshCw size={12} strokeWidth={2.4} />}
                {f >= 3 ? dict.order.done : dict.order.pending}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
