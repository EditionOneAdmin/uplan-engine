"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight"
          >
            Vom Flürstück zur Machbarkeitsentscheidung — in Minuten.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg md:text-xl text-slate-text/80 leading-relaxed max-w-xl"
          >
            ...automatisiert und optimiert die Machbarkeitsprüfung & Variantenplanung.
            U-Plan Engine findet die beste Planung für Ihr Grundstück.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <a
              href="#kontakt"
              className="bg-accent hover:bg-accent-light text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25"
            >
              Demo anfragen
            </a>
            <a
              href="#produkt"
              className="border border-gray-border text-slate-text font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-bg transition-all"
            >
              Beispiel-Report ansehen
            </a>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8 text-sm text-slate-text/50"
          >
            Für Projektentwickler · Bauträger · Bestandshalter
          </motion.p>
        </div>

        {/* Animated product mockup with hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/uplan-engine/images/hero-cityscape.jpg" alt="Moderne Stadtquartier-Visualisierung" className="rounded-2xl shadow-2xl mb-6 w-full object-cover" />
          <div className="bg-gray-bg rounded-2xl border border-gray-border p-8 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-red-400" />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {["Variante A", "Variante B", "Variante C"].map((v, i) => (
                  <motion.div
                    key={v}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                    className="bg-white rounded-lg p-4 border border-gray-border"
                  >
                    <div className="text-xs font-semibold text-primary mb-2">{v}</div>
                    <div className="space-y-1.5">
                      <div className="h-2 bg-accent/20 rounded-full">
                        <div className="h-2 bg-accent rounded-full" style={{ width: `${75 + i * 10}%` }} />
                      </div>
                      <div className="h-2 bg-primary/20 rounded-full">
                        <div className="h-2 bg-primary rounded-full" style={{ width: `${60 + i * 15}%` }} />
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-text/60">
                      GFZ {(1.2 + i * 0.3).toFixed(1)} · {3 + i} Geschosse
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                {["✅ B-Plan konform", "✅ LBO §6 geprüft", "⚠️ Stellplätze prüfen"].map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 + i * 0.1 }}
                    className="text-xs bg-white border border-gray-border px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
