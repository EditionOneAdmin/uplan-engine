"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "./store";
import { LayoutDashboard, Building2, Factory, Download, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/module", label: "Module", icon: Building2 },
  { href: "/admin/hersteller", label: "Hersteller", icon: Factory },
  { href: "/admin/export", label: "Export/Import", icon: Download },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated, logout, hydrate } = useAdminStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  if (!hydrated) return null;

  // pathname does NOT include basePath
  const isLogin = pathname === "/admin/login";
  if (isLogin) return <>{children}</>;

  if (!authenticated) {
    if (typeof window !== "undefined") router.replace("/admin/login");
    return null;
  }

  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">U-Plan Admin</h1>
        <button onClick={() => setMobileNav(!mobileNav)} className="text-slate-400 hover:text-white p-1">
          {mobileNav ? "✕" : "☰"}
        </button>
      </div>
      {mobileNav && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur pt-14">
          <nav className="p-4 space-y-1">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <button
                  key={n.href}
                  onClick={() => { router.push(n.href); setMobileNav(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                    active ? "bg-blue-600/20 text-blue-400" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <n.icon size={18} />
                  {n.label}
                </button>
              );
            })}
            <button
              onClick={() => { logout(); router.push("/admin/login"); setMobileNav(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-400 hover:text-red-400 mt-4"
            >
              <LogOut size={18} /> Logout
            </button>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900/80 border-r border-slate-800 flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            U-Plan Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <button
                key={n.href}
                onClick={() => router.push(n.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                  active
                    ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <n.icon size={18} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { logout(); router.push("/admin/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-600/10 transition cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-auto pt-16 md:pt-8">{children}</main>
    </div>
  );
}
