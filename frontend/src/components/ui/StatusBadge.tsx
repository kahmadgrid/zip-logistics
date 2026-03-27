import clsx from "clsx";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx("rounded-full px-2 py-1 text-xs font-semibold", {
        "bg-emerald-100 text-emerald-800": status.includes("DELIVERED"),
        "bg-rose-100 text-rose-700": status.includes("FAILED"),
        "bg-amber-100 text-amber-800": status.includes("IN_TRANSIT") || status.includes("OUT_FOR"),
        "bg-brand-100 text-brand-800": true
      })}
    >
      {status}
    </span>
  );
}

