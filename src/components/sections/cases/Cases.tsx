"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CasesDict } from "@/lib/i18n/dictionaries/cases.uk";
import { usePrefersReducedMotion } from "../hero/useStreamControls";
import { PhoneChat } from "./PhoneChat";
import { PipelineBoard } from "./PipelineBoard";
import { SyncBoard } from "./SyncBoard";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const VISIBLE_POINTS = 3;

type Item = CasesDict["items"][number];

/** Counts the leading number of a metric ("80%", "10 с") up from zero once it scrolls into view. */
function CountUp({ value, reduced }: { value: string; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    const m = value.match(/^(\d+)(.*)$/);
    const el = ref.current;
    if (!m || !el || reduced || !inView || Number(m[1]) === 0) return;
    const controls = animate(0, Number(m[1]), {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => (el.textContent = Math.round(v) + m[2]),
    });
    return () => controls.stop();
  }, [value, reduced, inView]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

function CaseSection({ item, index, dict }: { item: Item; index: number; dict: CasesDict }) {
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const paper = index % 2 === 1;
  const points = open ? item.solution : item.solution.slice(0, VISIBLE_POINTS);
  const listId = `case-${item.id}-solution`;

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  const muted = paper ? "text-ink/75" : "text-fg/85";
  // white/blue text with an orange marker: orange text on the blue background fails contrast
  const label = cn(
    "mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase before:size-1.5 before:shrink-0 before:rotate-45 before:bg-accent",
    paper ? "text-bg" : "text-muted",
  );

  return (
    <section
      id={index === 0 ? "cases" : undefined}
      aria-labelledby={`case-${item.id}-title`}
      // overflow-x-clip (not hidden) so the mock-up can stay sticky while the text scrolls
      className={cn("relative scroll-mt-16 overflow-x-clip", paper && "bg-paper text-ink selection:bg-bg selection:text-fg")}
    >
      <div className="mx-auto max-w-[1360px] px-4 py-20 md:px-8 md:py-28">
        {/* header spans the full width so the mock-up starts level with the body text */}
        <motion.header {...reveal()} className="mb-12 max-w-[900px] lg:mb-16">
          <span className="mb-5 inline-block rounded-full bg-accent px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-ink uppercase">
            {dict.eyebrow} · {item.name}
          </span>
          <h2 id={`case-${item.id}-title`} className="font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.06] font-bold tracking-[-0.02em]">
            {item.title}
          </h2>
          <p className={cn("mt-5 max-w-[56ch] text-lg leading-relaxed md:text-xl", muted)}>{item.lead}</p>
        </motion.header>

        {/* headline numbers: the result first, the how after */}
        <div className="mb-12 lg:mb-16">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {item.metrics.map((m, i) => (
              // signature move: the tile is "extruded" out of the page, like the isometric blocks
              <motion.div
                key={m.label}
                initial={reduced ? false : { opacity: 0, x: 8, y: 8, boxShadow: "0px 0px 0px 0px #ff6a1a" }}
                whileInView={{ opacity: 1, x: 0, y: 0, boxShadow: "7px 7px 0px 0px #ff6a1a" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.12, ease: EASE }}
                style={reduced ? { boxShadow: "7px 7px 0px 0px #ff6a1a" } : undefined}
                className={cn(
                  "flex flex-col-reverse gap-2 rounded-2xl border-[1.5px] p-5 md:p-6",
                  paper ? "border-ink bg-paper" : "border-fg bg-bg",
                )}
              >
                <dt className={cn("text-sm leading-snug md:text-base", muted)}>{m.label}</dt>
                <dd className={cn("font-display text-[clamp(2rem,3.6vw,3.2rem)] leading-none font-bold tracking-[-0.02em]", paper && "text-bg")}>
                  <CountUp value={m.value} reduced={reduced} />
                </dd>
              </motion.div>
            ))}
          </dl>
          {dict.metricsNote && <p className={cn("mt-5 text-[13px]", muted)}>{dict.metricsNote}</p>}
        </div>

        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-12">
          <div className={cn("flex min-w-0 flex-col gap-8 lg:col-span-5", paper && "lg:order-2")}>
            <motion.div {...reveal(0.05)}>
              <h3 className={label}>{dict.labels.task}</h3>
              <p className={cn("leading-relaxed", muted)}>{item.task}</p>
            </motion.div>

            <motion.div {...reveal(0.1)}>
              <h3 className={label}>{dict.labels.solution}</h3>
              <ul id={listId} className="flex flex-col gap-2.5">
                {points.map((pt) => (
                  <li key={pt.b} className="flex gap-3 leading-relaxed">
                    <span aria-hidden className="mt-[0.55em] size-2 shrink-0 rotate-45 bg-accent" />
                    <span className={muted}>
                      <b className={paper ? "text-ink" : "text-fg"}>{pt.b}</b> {pt.t}
                    </span>
                  </li>
                ))}
              </ul>
              {item.solution.length > VISIBLE_POINTS && (
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={listId}
                  onClick={() => setOpen((v) => !v)}
                  className={cn(
                    "mt-4 inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] px-4 text-[13px] font-semibold",
                    paper ? "border-ink/40 hover:border-ink" : "border-fg/50 hover:border-fg",
                  )}
                >
                  {open ? dict.less : dict.more}
                  <ChevronDown size={16} strokeWidth={2.2} className={cn("transition-transform", open && "rotate-180")} />
                </button>
              )}
            </motion.div>

            <motion.div {...reveal(0.15)}>
              <h3 className={label}>{dict.labels.result}</h3>
              <p className="text-lg leading-relaxed font-medium">{item.result}</p>
            </motion.div>

            <motion.div {...reveal(0.2)}>
              <h3 className={label}>{dict.labels.stack}</h3>
              <ul className="flex flex-wrap gap-2">
                {item.stack.map((s) => (
                  <li
                    key={s}
                    className={cn("rounded-full border-[1.5px] px-3 py-1.5 text-[13px] font-semibold", paper ? "border-ink/25" : "border-fg/35")}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div {...reveal(0.1)} className={cn("min-w-0 lg:sticky lg:top-24 lg:col-span-7", paper && "lg:order-1")}>
            {item.id === "assistant" ? (
              <PhoneChat dict={dict.mock.chat} />
            ) : item.id === "platform" ? (
              <PipelineBoard dict={dict.mock.board} />
            ) : (
              <SyncBoard dict={dict.mock.sync} />
            )}
            <p className={cn("mt-12 text-center text-[13px]", muted)}>{dict.mockNote}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function Cases({ dict }: { dict: CasesDict }) {
  return (
    <>
      {dict.items.map((item, i) => (
        <CaseSection key={item.id} item={item} index={i} dict={dict} />
      ))}
    </>
  );
}
