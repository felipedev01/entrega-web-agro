"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { brand, navigation, shellInsight } from "@/lib/content";

function getNavItemClassName(isActive: boolean) {
  return [
    "group relative block rounded-[18px] border px-3.5 py-3 transition-all duration-200",
    isActive
      ? "border-white/14 bg-white/[0.10] text-white shadow-[0_8px_18px_rgba(8,17,11,0.14)]"
      : "border-white/8 bg-white/[0.035] text-white/80 hover:border-white/14 hover:bg-white/[0.07] hover:text-white",
  ].join(" ");
}

function getNavLabelClassName(isActive: boolean) {
  return isActive
    ? "text-[15px] font-semibold text-white"
    : "text-[15px] font-medium text-white/72 group-hover:text-white";
}

function getNavDescriptionClassName(isActive: boolean) {
  return isActive
    ? "mt-1 text-[11px] leading-4 text-white/82"
    : "mt-1 text-[11px] leading-4 text-white/46 group-hover:text-white/78";
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="rounded-[28px] border border-[color:var(--sidebar-line)] bg-white/[0.06] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(85,140,92,0.95),rgba(200,126,70,0.9))] text-sm font-semibold text-white shadow-[0_16px_30px_rgba(36,91,60,0.35)]">
            SF
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/45">
              {brand.eyebrow}
            </p>
            <h1 className="mt-1 text-[1.7rem] font-semibold leading-none text-white">{brand.name}</h1>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/72">{brand.tagline}</p>
      </div>

      <nav className="mt-5 flex-1 space-y-2.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={getNavItemClassName(isActive)}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-[color:var(--sidebar-marker)]"
                />
              ) : null}
              <p className={getNavLabelClassName(isActive)}>
                {item.label}
              </p>
              <p className={getNavDescriptionClassName(isActive)}>
                {item.description}
              </p>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-[24px] border border-[color:var(--sidebar-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
          {shellInsight.eyebrow}
        </p>
        <h2 className="mt-3 text-[1.25rem] font-semibold leading-[1.15] text-white">{shellInsight.title}</h2>
        <p className="mt-3 text-sm leading-6 text-white/68">{shellInsight.description}</p>
      </div>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 px-3 py-3 lg:gap-4 lg:px-4 lg:py-4">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[310px] shrink-0 flex-col overflow-y-auto overflow-x-hidden rounded-[34px] border border-[color:var(--sidebar-line)] bg-[color:var(--sidebar)] p-4 shadow-[0_30px_120px_rgba(14,28,18,0.28)] backdrop-blur lg:flex">
          <SidebarContent pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:gap-4">
          <div className="animate-rise flex items-center justify-between rounded-[26px] border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-3 shadow-[0_18px_60px_rgba(36,46,31,0.08)] backdrop-blur lg:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
                {brand.eyebrow}
              </p>
              <p className="mt-1 text-lg font-semibold text-[color:var(--ink)]">{brand.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/80 text-[color:var(--ink)] transition hover:border-[color:var(--line-strong)]"
              aria-label="Abrir menu"
            >
              <span className="flex flex-col gap-1.5">
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
          </div>

          <main className="min-w-0 pb-8">{children}</main>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-[#101912]/45 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[88vw] max-w-[320px] flex-col overflow-y-auto overflow-x-hidden bg-[color:var(--sidebar)] p-4 shadow-[0_30px_120px_rgba(14,28,18,0.34)]">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--sidebar-line)] text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                aria-label="Fechar menu"
              >
                X
              </button>
            </div>
            <SidebarContent pathname={pathname} onNavigate={() => setIsMobileMenuOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
