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

  useEffect(() => { hydrate(); setHydrated(true); }, [hydrate]);

  if (!hydrated) return null;

  const isLogin = pathname?.endsWith("/admin/login");
  if (isLogin) return <>{children}</>;

  if (!authenticated) {
    if (typeof window !== "undefined") router.replace("/bplan-engine/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            B-Plan Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((n) => {
            const active = pathname === `/bplan-engine${n.href}` || pathname === n.href;
            return (
              <button key={n.href} onClick={() => router.push(`/bplan-engine${n.href}`)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                  active ? "bg-blue-600/20 text-blue-400 border border-blue-600/30" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}>
                <n.icon size={18} />{n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => { logout(); router.push("/bplan-engine/admin/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-600/10 transition cursor-pointer">
            <LogOut size={18} />Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
