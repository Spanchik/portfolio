import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  title: ReactNode;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** IDE-style panel: 1px border, compact header (title · badge · actions), body. */
export function Panel({ title, badge, actions, children, className }: Props) {
  return (
    <section className={cn("flex min-w-0 flex-col border border-line bg-panel", className)}>
      <header className="flex h-10 items-center gap-3 border-b border-line bg-panel-2 pl-3">
        <span className="truncate font-mono text-xs text-fg">{title}</span>
        {badge}
        {actions && <div className="ml-auto flex items-center">{actions}</div>}
      </header>
      {children}
    </section>
  );
}
