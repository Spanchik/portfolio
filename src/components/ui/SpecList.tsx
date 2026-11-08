import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SpecItem = { key: string; label: ReactNode; value: ReactNode };

/** Monospace key/value list rendered as a <dl>. */
export function SpecList({ items, className, columns = "md:grid-cols-[minmax(0,1fr)_auto]" }: { items: SpecItem[]; className?: string; columns?: string }) {
  return (
    <dl className={cn("divide-y divide-line border-y border-line font-mono text-xs", className)}>
      {items.map((item) => (
        <div key={item.key} className={cn("grid grid-cols-1 gap-x-6 gap-y-1 py-2 md:items-center", columns)}>
          <dt className="min-w-0 text-muted">{item.label}</dt>
          <dd className="min-w-0 text-fg">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
