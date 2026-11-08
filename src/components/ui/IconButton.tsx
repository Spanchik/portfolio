import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
  children: ReactNode;
};

/** Square icon button; ≥ 40×40 hit area, instant hover, visible focus. */
export function IconButton({ label, children, className, type = "button", ...rest }: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center border border-transparent text-muted",
        "hover:border-line-2 hover:text-fg aria-pressed:text-warn",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
