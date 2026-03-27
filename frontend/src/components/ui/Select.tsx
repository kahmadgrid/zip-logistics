import clsx from "clsx";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800",
        "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
        className
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

