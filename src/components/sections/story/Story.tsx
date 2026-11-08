"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import { cn } from "@/lib/cn";
import { IsoMachine } from "../hero/IsoMachine";
import { usePrefersReducedMotion } from "../hero/useStreamControls";
import type { StationKey } from "./scene";

const bare = (w: string) => w.replace(/[.,!?]/g, "");

/**
 * Hero + scroll story. A pinned 3D scene (three.js, lazy-loaded) is driven by scroll
 * through 6 steps; the copy for each step cross-fades on the left. Without WebGL the
 * SVG isometric machine is shown instead and only the first step is rendered.
 */
export function Story({ dict }: { dict: Dictionary }) {
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const [fallback, setFallback] = useState(false);

  const s = dict.machine.subs;
  const subs: Record<StationKey, string> = {
    tg: s.tg, web: s.web, api: s.api, rbac: s.rbac, agent: s.agent, tools: s.tools, c1: s.c1, db: s.sheets, wf: s.approval,
  };
  const subsKey = JSON.stringify(subs);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    import("./scene")
      .then(({ createStory }) => {
        if (cancelled || !canvasRef.current || !labelsRef.current || !trackRef.current) return;
        try {
          dispose = createStory({
            canvas: canvasRef.current,
            labelsEl: labelsRef.current,
            track: trackRef.current,
            stepEls: stepRefs.current.filter(Boolean) as HTMLElement[],
            railEls: railRefs.current.filter(Boolean) as HTMLElement[],
            subs: JSON.parse(subsKey),
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
  }, [reduced, subsKey]);

  const words = dict.hero.title.split(" ");
  const steps = dict.story.steps;

  return (
    <section
      ref={trackRef}
      id="hero"
      aria-labelledby="hero-title"
      className={cn("relative", fallback ? "h-dvh" : "h-[600vh]")}
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

        {/* readability veil under the copy */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgba(31,59,255,.95)_0%,rgba(31,59,255,.7)_35%,rgba(31,59,255,0)_60%)] md:bg-[linear-gradient(90deg,rgba(31,59,255,.92)_0%,rgba(31,59,255,.75)_30%,rgba(31,59,255,0)_52%)]"
        />

        <div className="pointer-events-none absolute inset-x-4 bottom-[10vh] md:inset-x-auto md:bottom-auto md:left-8 md:top-1/2 md:w-[min(560px,42vw)] lg:left-[max(2rem,calc((100vw-1360px)/2+2rem))]">
          {/* step 0 — hero copy */}
          <div
            ref={(el) => {
              stepRefs.current[0] = el;
            }}
            className="story-step pointer-events-auto"
            style={{ opacity: 1 }}
          >
            <h1 id="hero-title" className="font-display text-[clamp(2.3rem,4.6vw,4.9rem)] leading-[1.03] font-bold tracking-[-0.04em]">
              {words.map((w, i) => (
                <span key={i}>
                  {bare(w) === dict.hero.titleAccent ? <em className="bg-fg px-[0.12em] text-bg not-italic">{w}</em> : w}
                  {i < words.length - 1 && " "}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-[36ch] text-base leading-relaxed text-fg/90 md:text-lg">{dict.hero.subtitle}</p>
            {!fallback && (
              <p className="mt-8 inline-flex items-center gap-3 text-[13px] font-semibold text-fg/85">
                <span aria-hidden className="relative h-8 w-5 rounded-full border-2 border-fg after:absolute after:top-1.5 after:left-1/2 after:h-2 after:w-1 after:-translate-x-1/2 after:animate-bounce after:rounded-full after:bg-fg" />
                {dict.story.hint}
              </p>
            )}
          </div>

          {!fallback &&
            steps.map((st, i) => (
              <div
                key={st.k}
                ref={(el) => {
                  stepRefs.current[i + 1] = el;
                }}
                aria-hidden
                className="story-step"
                style={{ opacity: 0 }}
              >
                <span className="mb-5 inline-block rounded-full bg-accent px-3 py-1.5 text-xs font-semibold tracking-[0.12em] text-ink uppercase">
                  {st.k}
                </span>
                <h2 className="font-display text-[clamp(1.8rem,3.4vw,3.4rem)] leading-[1.05] font-bold tracking-[-0.035em]">{st.title}</h2>
                <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-fg/90 md:text-lg">{st.text}</p>
              </div>
            ))}
        </div>

        {!fallback && (
          <div aria-hidden className="absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-2.5 md:right-8 md:flex">
            {[0, ...steps.map((_, i) => i + 1)].map((i) => (
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
    </section>
  );
}
