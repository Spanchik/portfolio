"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import { site } from "@/lib/site";
import { pts } from "../hero/iso";
import { usePrefersReducedMotion } from "../hero/useStreamControls";
import { ContactForm } from "./ContactForm";

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

/**
 * Final call-to-action on the dark finale. Top row: headline and the isometric cubes.
 * Bottom row: the brief form (the primary action) and a short list of direct contacts.
 */
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
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.8, delay, ease: EASE },
        };

  const row = "flex min-h-16 items-center justify-between gap-3 border-b border-fg/20 py-3";
  const kind = "block text-xs font-semibold tracking-[0.12em] text-muted uppercase";
  const value = "block truncate font-display text-[15px] font-medium tracking-[-0.01em] md:text-lg";
  const round = "inline-flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-fg/50 transition-colors group-hover:border-fg group-hover:bg-fg group-hover:text-ink";

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative scroll-mt-16 overflow-hidden bg-ink [--iso-shadow:var(--color-bg)]">
      <div className="mx-auto max-w-[1360px] px-4 py-16 md:px-8 md:py-28">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <motion.h2
              {...reveal()}
              id="contact-title"
              className="max-w-[16ch] font-display text-[clamp(1.9rem,5vw,4.8rem)] leading-[1.05] font-bold tracking-[-0.02em]"
            >
              {dict.contact.title}
            </motion.h2>
            <motion.p {...reveal(0.1)} className="mt-5 max-w-[46ch] text-lg leading-relaxed text-fg/90 md:mt-6 md:text-xl">
              {dict.contact.text}
            </motion.p>
          </div>
          <motion.div aria-hidden {...reveal(0.15)} className="hidden w-full max-w-[250px] justify-self-end lg:col-span-4 lg:block">
            <svg viewBox="-104 -96 208 195" className={reduced ? "w-full" : "w-full animate-[float_6s_ease-in-out_infinite]"}>
              {CUBES.map((c, i) => (
                <CubeShape key={i} c={c} />
              ))}
            </svg>
          </motion.div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-12 border-t border-fg/20 pt-10 md:mt-14 md:pt-14 lg:grid-cols-12 lg:gap-10">
          <motion.div {...reveal(0.1)} className="min-w-0 lg:col-span-7">
            <ContactForm dict={dict.contact.form} />
          </motion.div>

          <motion.div {...reveal(0.2)} className="min-w-0 lg:col-span-4 lg:col-start-9">
            <h3 className="font-display text-xl font-medium tracking-[-0.01em] md:text-2xl">{dict.contact.direct}</h3>
            <ul className="mt-5 border-t border-fg/20 md:mt-7">
              <li className={row}>
                <a href={`mailto:${email}`} className="min-w-0 py-1">
                  <span className={kind}>Email</span>
                  <span className={`${value} underline decoration-fg/30 decoration-2 underline-offset-4 hover:decoration-accent`}>{email}</span>
                </a>
                <button
                  type="button"
                  onClick={copy}
                  aria-label={copied ? dict.contact.copied : dict.contact.copy}
                  title={copied ? dict.contact.copied : dict.contact.copy}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-fg/50 transition-colors hover:border-fg hover:bg-fg hover:text-ink"
                >
                  {copied ? <Check size={18} strokeWidth={2.2} /> : <Copy size={18} strokeWidth={2} />}
                </button>
                <span role="status" className="sr-only">
                  {copied ? dict.contact.copied : ""}
                </span>
              </li>
              {telegram && (
                <li>
                  <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer" className={`group ${row}`}>
                    <span className="min-w-0">
                      <span className={kind}>Telegram</span>
                      <span className={value}>@{telegram}</span>
                    </span>
                    <span className={round}>
                      <ArrowUpRight size={18} strokeWidth={2.2} />
                    </span>
                  </a>
                </li>
              )}
              {github && (
                <li>
                  <a href={github} target="_blank" rel="noopener noreferrer" className={`group ${row}`}>
                    <span className="min-w-0">
                      <span className={kind}>GitHub</span>
                      <span className={value}>{github.replace(/^https?:\/\/(www\.)?/, "")}</span>
                    </span>
                    <span className={round}>
                      <ArrowUpRight size={18} strokeWidth={2.2} />
                    </span>
                  </a>
                </li>
              )}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
