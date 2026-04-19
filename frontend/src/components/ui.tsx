import type { ReactNode } from "react";

import { brand, frameHighlights } from "@/lib/content";

export const inputClassName =
  "w-full rounded-[18px] border border-[color:var(--line)] bg-white/80 px-4 py-2.5 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";

export const buttonClassName =
  "rounded-full bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-[color:var(--accent-contrast)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_35px_rgba(36,91,60,0.24)] disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClassName =
  "rounded-full border border-[color:var(--line)] bg-white/72 px-5 py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--canvas)]";

export function Panel({
  title,
  eyebrow,
  children,
  actions,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="animate-rise min-w-0 max-w-full rounded-[26px] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_30px_90px_rgba(36,46,31,0.08)] backdrop-blur lg:p-[18px]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-[1.7rem] font-semibold leading-[1.08] text-[color:var(--ink)] lg:text-[1.85rem]">
            {title}
          </h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function PageFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <header className="animate-rise overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[linear-gradient(135deg,#1d432f_0%,#2f6944_52%,#8d542d_100%)] px-4 py-3 text-[color:var(--accent-contrast)] shadow-[0_28px_100px_rgba(23,43,28,0.16)] lg:px-4 lg:py-3.5">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/62 lg:text-[10px]">
          {eyebrow ?? brand.eyebrow}
        </p>
        <div className="max-w-5xl">
          <h1 className="max-w-5xl text-[1.75rem] font-semibold leading-[1.02] sm:text-[1.95rem] lg:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-4xl text-[13px] leading-5 text-white/78 lg:text-[13px] lg:leading-6">
            {description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72">
              {brand.name}
            </span>
            {frameHighlights.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/12 bg-white/[0.08] px-3 py-1 text-[10px] leading-4 text-white/74 lg:text-[11px]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export function StatusCallout({
  tone,
  message,
}: {
  tone: "info" | "success" | "error";
  message: string;
}) {
  const toneClasses = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
  };

  return <div className={`rounded-[18px] border px-4 py-2.5 text-sm ${toneClasses[tone]}`}>{message}</div>;
}

export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-[20px] border border-[color:var(--line)] bg-white/75 p-4 shadow-[0_12px_40px_rgba(54,72,48,0.06)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-3 text-[2rem] font-semibold leading-none text-[color:var(--ink)]">{value}</p>
      <p className="mt-1.5 text-[13px] leading-5 text-[color:var(--muted)]">{helper}</p>
    </article>
  );
}
