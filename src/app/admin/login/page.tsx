"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "../store";
import { Building2, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();
  const { login, hydrate, authenticated } = useAdminStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (authenticated) router.replace("/bplan-engine/admin");
  }, [authenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pw)) {
      router.push("/bplan-engine/admin");
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className={`relative z-10 w-full max-w-md px-6 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl shadow-blue-600/30 mb-6">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            B-Plan Engine
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Admin Panel</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                <Lock size={14} className="inline mr-1" />
                Passwort
              </label>
              <input
                type="password" value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                placeholder="Zugangspasswort eingeben..."
                autoFocus
                className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 ${
                  error ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                }`}
              />
              {error && <p className="text-red-400 text-xs mt-2">Falsches Passwort</p>}
            </div>
            <button type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 group cursor-pointer">
              Anmelden
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">Modularer Gebäudekatalog · Admin</p>
      </div>
    </div>
  );
}
