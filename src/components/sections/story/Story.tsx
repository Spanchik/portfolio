"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import { cn } from "@/lib/cn";
import { IsoMachine } from "../hero/IsoMachine";
import { usePrefersReducedMotion } from "../hero/useStreamControls";
import type { StationKey } from "./scene";

const bare = (w: string) => w.replace(/[.,!?]/g, "");

type Chat = Dictionary["story"]["chat"];

/** The conversation behind the scene: each message appears on its stage of the scroll. */
function StoryChat({ chat, stage, reduced }: { chat: Chat; stage: number; reduced: boolean }) {
  const messages = chat.messages.filter((m) => m.at <= stage);
  return (
    <div className="w-full max-w-[330px] overflow-hidden rounded-[26px] border-[6px] border-ink bg-paper text-ink shadow-[8px_8px_0_var(--color-accent)]">
      <div className="flex items-center gap-3 border-b-[1.5px] border-ink bg-white px-3.5 py-2.5">
        <span className="flex size-8 items-center justify-center rounded-full border-[1.5px] border-ink bg-accent font-display text-[10px] font-bold">HR</span>
        <span className="flex flex-col leading-tight">
          <b className="font-display text-xs">{chat.title}</b>
          <span className="text-[12px] text-ink/60">{chat.status}</span>
        </span>
      </div>
      <div className="flex h-[150px] flex-col justify-end gap-2 overflow-hidden p-3 text-[13px] leading-snug md:h-[min(276px,31vh)]">
        {messages.map((m) => (
          <motion.p
            key={m.text}
            initial={reduced ? false : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "max-w-[88%] shrink-0 rounded-2xl border-[1.5px] border-ink px-3 py-2",
              m.from === "user" ? "self-end rounded-br-sm bg-bg text-fg" : "self-start rounded-bl-sm bg-white",
            )}
          >
            {m.text}
          </motion.p>
        ))}
        {stage >= 4 && (
          <motion.span
            initial={reduced ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex shrink-0 items-center gap-1.5 self-center rounded-full border-[1.5px] border-ink bg-accent px-3 py-1.5 text-[12px] font-semibold"
          >
            <Check size={13} strokeWidth={3} />
            {chat.approved}
          </motion.span>
        )}
      </div>
    </div>
  );
}

/**
 * Hero + scroll story. A pinned 3D scene (three.js, lazy-loaded) is driven by scroll:
 * the prologue assembles the machine, then one real request is followed through
 * it. On the left a chat shows the conversation; each message lights up its block on the
 * right. Without WebGL the SVG isometric machine is shown and only the hero is rendered.
 */
export function Story({ dict }: { dict: Dictionary }) {
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const [fallback, setFallback] = useState(false);
  /** 0 = hero, 1–3 = the request's stages, 4 = the whole system. Set by the scene. */
  const [stage, setStage] = useState(0);

  const s = dict.machine.subs;
  const subs: Record<StationKey, string> = { tg: s.tg, web: s.web, rbac: s.rbac, agent: s.agent, c1: s.c1, db: s.sheets, wf: s.approval };
  const subsKey = JSON.stringify(subs);
  const tagsKey = JSON.stringify(dict.story.tags);
  const offlineLabel = dict.story.offline;

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    // start the 3D scene once the page is idle, so it does not compete with the first paint
    const whenIdle = new Promise<void>((resolve) => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(() => resolve(), { timeout: 1200 });
      else setTimeout(resolve, 200);
    });
    whenIdle
      .then(() => import("./scene"))
      .then(({ createStory }) => {
        if (cancelled || !canvasRef.current || !labelsRef.current || !flashRef.current || !cursorRef.current || !hintRef.current || !trackRef.current) return;
        try {
          dispose = createStory({
            canvas: canvasRef.current,
            labelsEl: labelsRef.current,
            flashEl: flashRef.current,
            cursorEl: cursorRef.current,
            hintEl: hintRef.current,
            offlineLabel,
            track: trackRef.current,
            stepEls: stepRefs.current.filter(Boolean) as HTMLElement[],
            railEls: railRefs.current.filter(Boolean) as HTMLElement[],
            subs: JSON.parse(subsKey),
            tags: JSON.parse(tagsKey),
            onStage: setStage,
            reduced,
          });
        } catch {
          setFallback(true);
        }
      })
      .catch(() => setFallback(true));
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [reduced, subsKey, tagsKey, offlineLabel]);

  const words = dict.hero.title.split(" ");
  const stages = dict.story.stages;
  // the caption shown next to the chat; during the hero the first one is kept ready
  const shown = Math.min(stages.length, Math.max(1, stage));
  const primary =
    "inline-flex h-12 items-center gap-2 rounded-full bg-fg px-6 text-sm font-semibold text-bg btn-iso hover:bg-accent hover:text-ink";

  return (
    <section
      ref={trackRef}
      id="hero"
      aria-labelledby="hero-title"
      className={cn("relative", fallback ? "h-dvh" : "h-[400vh]")}
    >
      <div className="sticky top-0 h-dvh overflow-hidden">
        {fallback ? (
          <div className="absolute inset-y-0 right-0 flex w-full items-center px-4 md:w-[58%] md:px-8">
            <IsoMachine label={dict.machine.label} caption={dict.machine.caption} subs={dict.machine.subs} pauseLabel={dict.machine.pause} />
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} role="img" aria-label={dict.story.sceneLabel} className="absolute inset-0 block size-full" />
            <div ref={labelsRef} aria-hidden className="pointer-events-none absolute inset-0" />
          </>
        )}

        {/* flash at the end of the prologue (driven by the scene) */}
        <div
          ref={flashRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_52%,rgba(255,255,255,.95),rgba(255,170,110,.35)_30%,rgba(255,255,255,0)_60%)] opacity-0 mix-blend-screen"
        />

        {/* "break the system" hint, faded in by the scene once the machine is assembled */}
        {!fallback && (
          <p
            ref={hintRef}
            aria-hidden
            className="pointer-events-none absolute right-4 bottom-6 z-10 hidden items-center gap-2 rounded-full bg-ink/70 px-4 py-2 text-xs font-semibold opacity-0 backdrop-blur transition-opacity duration-300 md:right-8 lg:inline-flex"
          >
            <span aria-hidden className="size-2 rotate-45 bg-accent" />
            {dict.story.breakHint}
          </p>
        )}

        {/* readability veil under the copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(31,59,255,.96)_0%,rgba(31,59,255,.85)_42%,rgba(31,59,255,0)_62%)] md:bg-[linear-gradient(90deg,rgba(31,59,255,.92)_0%,rgba(31,59,255,.75)_30%,rgba(31,59,255,0)_52%)]"
        />

        <div className="pointer-events-none absolute inset-x-4 bottom-[5vh] md:inset-x-auto md:bottom-auto md:left-8 md:top-[calc(50%+1.75rem)] md:w-[min(720px,46vw)] lg:left-[max(2rem,calc((100vw-1360px)/2+2rem))]">
          {/* step 0 — hero copy */}
          <div
            ref={(el) => {
              stepRefs.current[0] = el;
            }}
            className="story-step"
            style={{ opacity: 1 }}
          >
            <h1 id="hero-title" className="font-display text-[clamp(2.2rem,3.9vw,4.4rem)] leading-[1.08] font-bold tracking-[-0.02em] text-balance">
              {words.map((w, i) => (
                <span key={i}>
                  {bare(w) === dict.hero.titleAccent ? <em className="bg-fg px-[0.12em] text-bg not-italic">{w}</em> : w}
                  {i < words.length - 1 && " "}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-fg/90 md:text-lg">{dict.hero.subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#contact" className={primary}>
                {dict.hero.ctaPrimary}
                <ArrowUpRight size={17} strokeWidth={2.2} />
              </a>
              <a
                href="#cases"
                className="inline-flex h-12 items-center gap-2 rounded-full border-[1.5px] border-fg px-6 text-sm font-semibold btn-iso hover:bg-fg hover:text-bg"
              >
                {dict.hero.ctaSecondary}
              </a>
            </div>
            {!fallback && (
              <p className="mt-7 inline-flex items-center gap-2 text-[13px] font-semibold text-fg/80">
                <ArrowDown aria-hidden size={16} strokeWidth={2.2} className="motion-safe:animate-bounce" />
                {dict.story.hint}
              </p>
            )}
          </div>

          {/* steps 1–4 — one block: the caption of the current stage above the live chat */}
          {!fallback && (
            <div
              ref={(el) => {
                stepRefs.current[1] = el;
              }}
              aria-hidden
              className="story-step"
              style={{ opacity: 0 }}
            >
              {/* captions share one grid cell, so the chat below never jumps */}
              <div className="mb-4 grid max-w-[560px] md:mb-6">
                {stages.map((st, i) => {
                  const on = i + 1 === shown;
                  return (
                    <div
                      key={st.k}
                      aria-hidden={!on}
                      className={cn("col-start-1 row-start-1 self-end transition-opacity duration-300", on ? "opacity-100" : "pointer-events-none opacity-0")}
                    >
                      <span className="mb-3 inline-block rounded-full bg-fg px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-bg uppercase md:mb-4">
                        {st.k}
                      </span>
                      <h2 className="font-display text-[clamp(1.35rem,2.5vw,2.4rem)] leading-[1.1] font-bold tracking-[-0.02em]">{st.title}</h2>
                      <p className="mt-3 hidden max-w-[40ch] leading-relaxed text-fg/90 md:block">{st.text}</p>
                      {i === stages.length - 1 && (
                        <a href="#cases" tabIndex={on ? undefined : -1} className={cn(primary, "mt-4 md:mt-5")}>
                          {dict.story.cta}
                          <ArrowDown size={17} strokeWidth={2.2} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
              <StoryChat chat={dict.story.chat} stage={stage} reduced={reduced} />
            </div>
          )}
        </div>

        {!fallback && (
          <div aria-hidden className="absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-2.5 md:right-8 md:flex">
            {[0, ...stages.map((_, i) => i + 1)].map((i) => (
              <span key={i} className="relative h-7 w-1 overflow-hidden rounded-full bg-fg/30">
                <i
                  ref={(el) => {
                    railRefs.current[i] = el;
                  }}
                  className="absolute inset-0 origin-top scale-y-0 bg-fg"
                />
              </span>
            ))}
          </div>
        )}
      </div>
      {/* legacy cursor node, kept hidden (the scene still receives it) */}
      <div ref={cursorRef} aria-hidden className="pointer-events-none fixed top-0 left-0 size-0 opacity-0" />
    </section>
  );
}
