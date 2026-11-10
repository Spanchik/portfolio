"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Check, FileSpreadsheet, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CasesDict } from "@/lib/i18n/dictionaries/cases.uk";
import { useInView, usePrefersReducedMotion } from "../hero/useStreamControls";

type Chat = CasesDict["mock"]["chat"];

const CARD = "rounded-2xl border-[1.5px] border-ink bg-white p-3 text-ink shadow-[6px_6px_0_var(--color-ink)]";
const CARD_TITLE = "font-display text-[11.5px] font-bold tracking-[0.04em] uppercase";

/** Floating product card around the phone (desktop only). */
function Float({ className, delay, children }: { className: string; delay: number; children: ReactNode }) {
  return (
    <div className={cn("absolute z-10 hidden sm:block", className)}>
      <div className={cn(CARD, "animate-[float_6s_ease-in-out_infinite]")} style={{ animationDelay: `${delay}s` }}>
        {children}
      </div>
    </div>
  );
}

/** HR Assistant collage: self-playing bot chat + floating product cards (fictional data). */
export function PhoneChat({ dict }: { dict: Chat }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, 0.3);
  const total = dict.messages.length;
  // step = number of visible messages; total + 1 = request approved
  const [step, setStep] = useState(0);
  const shown = reduced ? total + 1 : step;
  const approved = shown > total;

  useEffect(() => {
    if (reduced || !inView) return;
    const done = step >= total + 1;
    const delay = done ? 3800 : step === total ? 1300 : dict.messages[step].from === "bot" ? 1500 : 1000;
    const t = window.setTimeout(() => setStep(done ? 0 : step + 1), delay);
    return () => window.clearTimeout(t);
  }, [step, total, reduced, inView, dict.messages]);

  const typing = !reduced && shown > 0 && shown < total && dict.messages[shown].from === "bot";
  const ring = 2 * Math.PI * 26;

  return (
    <div ref={ref} role="img" aria-label={dict.label} className="relative mx-auto h-[580px] w-full max-w-[640px] sm:h-[640px]">
      <div aria-hidden>
        {/* phone */}
        <div className="absolute top-0 left-1/2 flex h-[560px] w-[min(280px,78vw)] -translate-x-1/2 flex-col overflow-hidden rounded-[40px] border-[10px] border-ink bg-paper text-ink shadow-[12px_12px_0_var(--color-accent)]">
          <div className="flex items-center gap-3 border-b-[1.5px] border-ink bg-white px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full border-[1.5px] border-ink bg-accent font-display text-[11.5px] font-bold">HR</span>
            <span className="flex flex-col leading-tight">
              <b className="font-display text-[13px]">{dict.title}</b>
              <span className="text-[12.5px] text-ink/60">{dict.status}</span>
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden p-3 text-sm leading-snug">
            {dict.messages.slice(0, Math.min(shown, total)).map((m, i) => (
              <motion.div
                key={m.text}
                initial={reduced ? false : { opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={cn("flex max-w-[86%] flex-col gap-1.5", m.from === "user" ? "self-end" : "self-start")}
              >
                <p
                  className={cn(
                    "rounded-2xl border-[1.5px] border-ink px-3 py-2",
                    m.from === "user" ? "rounded-br-sm bg-bg text-fg" : "rounded-bl-sm bg-white",
                  )}
                >
                  {m.text}
                </p>
                {i === 1 && (
                  <span className="flex gap-1.5">
                    {dict.quick.map((q, k) => (
                      <span key={q} className={cn("rounded-full border-[1.5px] border-ink px-2.5 py-1 text-[12.5px] font-semibold", k === 0 ? "bg-accent" : "bg-white")}>
                        {q}
                      </span>
                    ))}
                  </span>
                )}
              </motion.div>
            ))}
            {typing && (
              <span className="flex w-14 items-center justify-center gap-1 self-start rounded-2xl rounded-bl-sm border-[1.5px] border-ink bg-white py-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 animate-bounce rounded-full bg-ink/60" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            )}
            {approved && (
              <motion.span
                initial={reduced ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 self-center rounded-full border-[1.5px] border-ink bg-accent px-2.5 py-1.5 text-[12px] font-semibold whitespace-nowrap"
              >
                <Check size={13} strokeWidth={3} />
                {dict.approved}
              </motion.span>
            )}
          </div>

          <div className="flex items-center gap-2 border-t-[1.5px] border-ink bg-white px-3 py-2.5">
            <span className="flex-1 rounded-full border-[1.5px] border-ink/30 px-3 py-2 text-[13px] text-ink/45">{dict.input}</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-bg text-fg">
              <Send size={14} strokeWidth={2.2} />
            </span>
          </div>
        </div>

        {/* payslip */}
        <Float className="top-8 left-0 w-[200px] -rotate-6" delay={0}>
          <p className={CARD_TITLE}>{dict.payslip.title}</p>
          <p className="mb-2 text-[12.5px] text-ink/60">{dict.payslip.period}</p>
          {dict.payslip.rows.map((r, i) => (
            <p key={r.label} className={cn("flex justify-between border-t border-ink/15 py-1 text-[13px]", i === 2 && "font-bold")}>
              <span>{r.label}</span>
              <span className={cn("tabular-nums", i === 2 && "rounded bg-accent px-1")}>{r.value}</span>
            </p>
          ))}
        </Float>

        {/* vacation balance */}
        <Float className="top-20 right-0 w-[158px] rotate-6" delay={1.2}>
          <p className={cn(CARD_TITLE, "mb-1")}>{dict.balance.title}</p>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-paper)" strokeWidth="9" />
              <motion.circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="var(--color-bg)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={ring}
                initial={{ strokeDashoffset: reduced ? ring * (1 - 14 / 24) : ring }}
                whileInView={{ strokeDashoffset: ring * (1 - 14 / 24) }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4 }}
              />
            </svg>
            <p className="leading-tight">
              <b className="font-display text-2xl">{dict.balance.value}</b>
              <span className="block text-[11.5px] text-ink/60">{dict.balance.of}</span>
            </p>
          </div>
        </Float>

        {/* approval request */}
        <Float className="bottom-0 left-0 w-[212px] rotate-3" delay={2.1}>
          <p className={CARD_TITLE}>{dict.approval.title}</p>
          <p className="mb-2.5 text-[12.5px] text-ink/60">{dict.approval.meta}</p>
          {approved ? (
            <motion.p
              initial={reduced ? false : { scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex w-fit items-center gap-1.5 rounded-full border-[1.5px] border-ink bg-accent px-3 py-1 text-[13px] font-bold"
            >
              <Check size={13} strokeWidth={3} />
              {dict.approval.done}
            </motion.p>
          ) : (
            <p className="flex gap-1.5 text-[12.5px] font-semibold">
              <span className="rounded-full border-[1.5px] border-ink bg-bg px-2.5 py-1 text-fg">{dict.approval.approve}</span>
              <span className="rounded-full border-[1.5px] border-ink px-2.5 py-1">{dict.approval.reject}</span>
            </p>
          )}
        </Float>

        {/* excel report */}
        <Float className="right-1 bottom-3 w-[180px] -rotate-3" delay={3}>
          <p className={cn(CARD_TITLE, "flex items-center gap-1.5")}>
            <FileSpreadsheet size={14} strokeWidth={2.2} />
            {dict.report.title}
          </p>
          <div className="mt-2 flex h-12 items-end gap-1.5">
            {[0.45, 0.7, 0.55, 0.9, 0.65, 1].map((h, i) => (
              <motion.span
                key={i}
                className={cn("flex-1 origin-bottom rounded-t border-[1.5px] border-ink", i === 5 ? "bg-accent" : "bg-bg")}
                style={{ height: `${h * 100}%` }}
                initial={{ scaleY: reduced ? 1 : 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[11.5px] text-ink/60">{dict.report.file}</p>
        </Float>
      </div>
    </div>
  );
}
