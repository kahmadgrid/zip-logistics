import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">{children}</div>;
}

