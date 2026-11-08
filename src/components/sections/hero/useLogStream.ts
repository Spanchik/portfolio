"use client";

import { useEffect, useRef, useState } from "react";
import { INITIAL_COUNT, INITIAL_LINES, SCENARIO, TYPE_MS_PER_CHAR, lineColumns, type LogLine } from "./log-scenarios";

const BUFFER = 30;

/**
 * Line-level demo stream. State changes once per emitted line — typing is a CSS
 * animation, so React never re-renders per character. The single pending timer
 * is cleared whenever `active` turns false (pause, off-screen, hidden tab) and
 * on unmount.
 */
export function useLogStream(active: boolean) {
  const [lines, setLines] = useState<LogLine[]>(INITIAL_LINES);

  const nextIndex = useRef(INITIAL_COUNT);
  const nextId = useRef(INITIAL_COUNT);
  // Demo clock that only advances while the stream is active.
  const clock = useRef(INITIAL_LINES[INITIAL_LINES.length - 1].t);

  useEffect(() => {
    if (!active) return;

    const resumedAt = performance.now();
    const base = clock.current;
    let timer: number | undefined;

    const emit = () => {
      const entry = SCENARIO[nextIndex.current % SCENARIO.length];
      nextIndex.current += 1;

      const now = performance.now();
      const line: LogLine = { ...entry, id: nextId.current++, t: base + (now - resumedAt), animate: true };
      setLines((prev) => (prev.length >= BUFFER ? [...prev.slice(prev.length - BUFFER + 1), line] : [...prev, line]));

      // Next line after this one has finished typing, plus a short irregular pause.
      const typing = lineColumns(line).length * TYPE_MS_PER_CHAR;
      timer = window.setTimeout(emit, typing + 260 + Math.random() * 420);
    };

    timer = window.setTimeout(emit, 450);

    return () => {
      window.clearTimeout(timer);
      clock.current = base + (performance.now() - resumedAt);
    };
  }, [active]);

  return lines;
}
