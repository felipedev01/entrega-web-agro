import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/fazendas", label: "Fazendas" },
  { href: "/talhoes", label: "Talhoes" },
  { href: "/registros", label: "Registros" },
  { href: "/relatorios", label: "Relatorios" },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(61,109,67,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(138,68,43,0.14),transparent_26%),linear-gradient(180deg,#f5efe2_0%,#f0eadc_48%,#ece4d6_100%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-5 lg:px-8">
        <nav className="animate-rise flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface)]/90 px-5 py-4 shadow-[0_18px_60px_rgba(54,72,48,0.08)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">Agro Analytics</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--ink)]">Monitoramento web com Oracle real</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-4 py-2 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--line-strong)] hover:bg-white/70"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="pb-10">{children}</main>
      </div>
    </div>
  );
}
