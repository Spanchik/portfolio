"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CasesDict } from "@/lib/i18n/dictionaries/cases.uk";
import { pts } from "../hero/iso";
import { useInView, usePrefersReducedMotion } from "../hero/useStreamControls";

type Site = CasesDict["mock"]["site"];

type Cube = { x: number; y: number; z: number; s: number; accent?: boolean };
const CUBES: Cube[] = [
  { x: 0, y: 0, z: 0, s: 2.4 },
  { x: 2.6, y: 0.4, z: 0, s: 1.6, accent: true },
  { x: 0.4, y: 2.6, z: 0, s: 1.6 },
  { x: 0.6, y: 0.6, z: 2.4, s: 1.2, accent: true },
];

function Cubes({ className }: { className?: string }) {
  return (
    <svg viewBox="-110 -110 220 200" className={className}>
      {CUBES.map(({ x, y, z, s, accent }, i) => (
        <g key={i} stroke="#fff" strokeWidth={1.6} strokeLinejoin="round">
          <polygon points={pts([[x, y + s, z], [x + s, y + s, z], [x + s, y + s, z + s], [x, y + s, z + s]])} fill={accent ? "var(--color-accent-deep)" : "var(--color-face-left)"} />
          <polygon points={pts([[x + s, y, z], [x + s, y + s, z], [x + s, y + s, z + s], [x + s, y, z + s]])} fill={accent ? "#b33f00" : "var(--color-face-right)"} />
          <polygon points={pts([[x, y, z + s], [x + s, y, z + s], [x + s, y + s, z + s], [x, y + s, z + s]])} fill={accent ? "var(--color-accent)" : "var(--color-face-top)"} />
        </g>
      ))}
    </svg>
  );
}

/** Portfolio case mock-up: this site's first screen in a browser and on a phone, switching language on a loop. */
export function SiteMock({ dict }: { dict: Site }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, 0.3);
  const [frame, setFrame] = useState(0);
  const lang = reduced ? 0 : frame % 2;

  useEffect(() => {
    if (reduced || !inView) return;
    const t = window.setTimeout(() => setFrame((f) => f + 1), 2800);
    return () => window.clearTimeout(t);
  }, [frame, reduced, inView]);

  const screen = (compact: boolean) => (
    <div className={cn("relative flex h-full flex-col bg-bg text-fg", compact ? "p-3" : "p-5")}>
      <div className="flex items-center justify-between">
        <span className={cn("font-semibold", compact ? "text-[10px]" : "text-xs")}>{compact ? dict.name.split(" ")[0] : dict.name}</span>
        <span className={cn("flex items-center gap-1 font-semibold", compact ? "text-[10px]" : "text-xs")}>
          {dict.langs.map((l, i) => (
            <span
              key={l}
              className={cn(
                "rounded-full border-[1.5px] py-0.5 transition-colors duration-300",
                compact ? "px-1" : "px-2",
                i === lang ? "border-fg" : "border-transparent text-fg/60",
              )}
            >
              {l}
            </span>
          ))}
        </span>
      </div>
      <div className={cn("flex flex-1 flex-col justify-center", compact ? "gap-2.5" : "max-w-[62%] gap-4")}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={lang}
            initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
            transition={{ duration: 0.25 }}
            className={cn("font-display leading-[1.1] font-bold tracking-[-0.02em]", compact ? "text-[15px]" : "text-[clamp(1.1rem,2.4vw,1.7rem)]")}
          >
            {dict.titles[lang]}
          </motion.p>
        </AnimatePresence>
        <span
          className={cn(
            "flex w-fit items-center gap-1.5 rounded-full bg-fg font-semibold whitespace-nowrap text-bg",
            compact ? "px-2 py-1 text-[9px]" : "px-4 py-2 text-[13px]",
          )}
        >
          {dict.ctas[lang]}
          <ArrowUpRight size={compact ? 11 : 14} strokeWidth={2.4} />
        </span>
      </div>
      {!compact && <Cubes className={cn("absolute right-4 bottom-4 w-[34%]", !reduced && inView && "animate-[float_6s_ease-in-out_infinite]")} />}
    </div>
  );

  return (
    <div ref={ref} role="img" aria-label={dict.label} className="relative mx-auto w-full max-w-[720px]">
      <div aria-hidden>
        <div className="overflow-hidden rounded-2xl border-[1.5px] border-ink bg-white text-ink shadow-[12px_12px_0_var(--color-bg)]">
          <div className="flex items-center gap-2 border-b-[1.5px] border-ink bg-paper px-4 py-2.5">
            <span className="size-2.5 rounded-full border border-ink bg-accent" />
            <span className="size-2.5 rounded-full border border-ink" />
            <span className="size-2.5 rounded-full border border-ink" />
            <span className="ml-3 truncate rounded-full border-[1.5px] border-ink/25 bg-white px-3 py-0.5 text-[12.5px] font-medium text-ink/60">
              {dict.url}/{dict.langs[lang].toLowerCase()}
            </span>
          </div>
          <div className="h-[300px] sm:h-[340px]">{screen(false)}</div>
        </div>

        {/* language toast */}
        <AnimatePresence>
          {lang === 1 && (
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

        {/* the same screen on a phone */}
        <div className="absolute -bottom-12 -left-4 z-10 hidden h-[230px] w-[132px] -rotate-3 overflow-hidden rounded-[22px] border-[6px] border-ink shadow-[6px_6px_0_var(--color-accent)] sm:block">
          {screen(true)}
        </div>
      </div>
    </div>
  );
}
