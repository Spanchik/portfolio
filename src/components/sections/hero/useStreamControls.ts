"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** Hydration-safe: the server snapshot is `false`, the client value applies right after hydration. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

/** True while the element intersects the viewport. */
export function useInView(ref: RefObject<Element | null>, threshold = 0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return inView;
}

/** False while the tab is hidden. */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  return visible;
}
