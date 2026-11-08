import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "ok" | "warn" | "muted";

const tones: Record<BadgeTone, string> = {
  ok: "border-ok/40 text-ok",
  warn: "border-warn/40 text-warn",
  muted: "border-line-2 text-muted",
};

export function Badge({ tone, children, className }: { tone: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-[2px] border px-1.5 py-px font-mono text-[10px] leading-4 tracking-[0.08em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
