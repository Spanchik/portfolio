"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import { site } from "@/lib/site";
import { pts } from "../hero/iso";
import { usePrefersReducedMotion } from "../hero/useStreamControls";

const EASE = [0.2, 0.7, 0.2, 1] as const;

type Cube = { x: number; y: number; z: number; s: number; accent?: boolean };
const CUBES: Cube[] = [
  { x: 0, y: 0, z: 0, s: 2.4 },
  { x: 2.6, y: 0.4, z: 0, s: 1.6, accent: true },
  { x: 0.4, y: 2.6, z: 0, s: 1.6 },
  { x: 0.6, y: 0.6, z: 2.4, s: 1.2, accent: true },
];

function CubeShape({ c }: { c: Cube }) {
  const { x, y, z, s } = c;
  const top = pts([[x, y, z + s], [x + s, y, z + s], [x + s, y + s, z + s], [x, y + s, z + s]]);
  const left = pts([[x, y + s, z], [x + s, y + s, z], [x + s, y + s, z + s], [x, y + s, z + s]]);
  const right = pts([[x + s, y, z], [x + s, y + s, z], [x + s, y + s, z + s], [x + s, y, z + s]]);
  return (
    <g stroke="#fff" strokeWidth={1.4} strokeLinejoin="round">
      <polygon points={left} fill={c.accent ? "var(--color-accent-deep)" : "var(--color-face-left)"} />
      <polygon points={right} fill={c.accent ? "#b33f00" : "var(--color-face-right)"} />
      <polygon points={top} fill={c.accent ? "var(--color-accent)" : "var(--color-face-top)"} />
    </g>
  );
}

/** Final call-to-action: big e-mail, copy button, profile links, decorative isometric cubes. */
export function Contact({ dict }: { dict: Dictionary }) {
  const reduced = usePrefersReducedMotion();
  const [copied, setCopied] = useState(false);
  const { email, github, telegram } = site.contacts;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the mailto link still works */
    }
  };

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
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-16 overflow-hidden bg-ink [--iso-shadow:var(--color-bg)]">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-center gap-12 px-4 py-24 md:px-8 md:py-36 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-8 lg:col-span-8">
          <motion.h2
            {...reveal()}
            id="contact-title"
            className="max-w-[14ch] font-display text-[clamp(1.85rem,5.4vw,5.2rem)] leading-[1.05] font-bold tracking-[-0.02em]"
          >
            {dict.contact.title}
          </motion.h2>
          <motion.p {...reveal(0.1)} className="max-w-[44ch] text-lg leading-relaxed text-fg/90 md:text-xl">
            {dict.contact.text}
          </motion.p>

          <motion.div {...reveal(0.2)} className="flex min-w-0 items-center gap-3">
            <a
              href={`mailto:${email}`}
              className="group min-w-0 truncate font-display text-[clamp(0.85rem,3vw,2.4rem)] font-bold tracking-[-0.02em] underline decoration-fg/40 decoration-2 underline-offset-[0.18em] hover:decoration-accent"
            >
              {email}
            </a>
            <button
              type="button"
              onClick={copy}
              aria-label={copied ? dict.contact.copied : dict.contact.copy}
              title={copied ? dict.contact.copied : dict.contact.copy}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-fg/60 hover:border-fg"
            >
              {copied ? <Check size={18} strokeWidth={2.2} /> : <Copy size={18} strokeWidth={2} />}
            </button>
            <span role="status" className="sr-only">
              {copied ? dict.contact.copied : ""}
            </span>
          </motion.div>

          <motion.div {...reveal(0.3)} className="flex flex-wrap gap-3">
            {/* one primary action: Telegram when set, otherwise e-mail (the address itself is above) */}
            {telegram && (
              <a
                href={`https://t.me/${telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 items-center gap-2 rounded-full bg-fg px-7 font-display text-sm font-bold text-bg btn-iso hover:bg-accent hover:text-ink"
              >
                {dict.contact.write}
                <ArrowUpRight size={18} strokeWidth={2.2} />
              </a>
            )}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 items-center gap-2 rounded-full border-[1.5px] border-fg px-7 font-display text-sm font-bold btn-iso hover:bg-fg hover:text-bg"
              >
                GitHub <ArrowUpRight size={18} strokeWidth={2.2} />
              </a>
            )}
          </motion.div>
        </div>

        <motion.div
          aria-hidden
          {...reveal(0.15)}
          className="mx-auto w-full max-w-[220px] lg:col-span-4 lg:max-w-[340px]"
        >
          <svg viewBox="-110 -110 220 200" className={reduced ? "w-full" : "w-full animate-[float_6s_ease-in-out_infinite]"}>
            {CUBES.map((c, i) => (
              <CubeShape key={i} c={c} />
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
