import clsx from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger";
  }
>;

export function Button({ variant = "primary", className, children, ...rest }: Props) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-brand-500 text-white hover:bg-brand-600": variant === "primary",
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50": variant === "secondary",
          "bg-rose-500 text-white hover:bg-rose-600": variant === "danger"
        },
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

