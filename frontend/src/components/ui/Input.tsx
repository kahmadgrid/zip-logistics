import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800",
        "placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
        className
      )}
      {...rest}
    />
  );
}

