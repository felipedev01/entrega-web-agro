import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";

export const buttonClassName =
  "rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--accent-contrast)] transition hover:translate-y-[-1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClassName =
  "rounded-full border border-[color:var(--line)] bg-white/70 px-5 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--canvas)]";

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
    <section className="animate-rise rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface)]/90 p-6 shadow-[0_24px_80px_rgba(54,72,48,0.08)] backdrop-blur">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-2xl font-semibold text-[color:var(--ink)]">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function PageFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="animate-rise overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(61,109,67,0.95),rgba(138,68,43,0.92))] p-8 text-[color:var(--accent-contrast)] shadow-[0_24px_100px_rgba(70,90,60,0.16)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Cap 6 - Python e alem</p>
        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">{description}</p>
          </div>
          <div className="rounded-[24px] border border-white/18 bg-white/10 p-5 text-sm leading-7 text-white/80">
            <p>Front em Next.js, API FastAPI e Oracle como persistencia central.</p>
            <p className="mt-3">Quando a API estiver exposta pelo tunnel, esta interface tambem pode operar publicada na Vercel.</p>
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

  return <div className={`rounded-2xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>{message}</div>;
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
    <article className="rounded-[24px] border border-[color:var(--line)] bg-white/75 p-5 shadow-[0_12px_40px_rgba(54,72,48,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-[color:var(--ink)]">{value}</p>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{helper}</p>
    </article>
  );
}
