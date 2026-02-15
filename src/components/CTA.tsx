"use client";

import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

export default function CTA() {
  return (
    <section className="py-20 md:py-32 px-6 bg-gray-bg relative overflow-hidden" id="kontakt">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/uplan-engine/images/cta-background.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none" />
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
            Bereit für schnellere Genehmigungen?
          </h2>
          <p className="mt-6 text-lg text-slate-text/70 leading-relaxed">
            Vereinbaren Sie eine Demo und sehen Sie U-Plan Engine mit Ihren eigenen Projekten.
            Wir zeigen Ihnen, wie Sie Ihre Pipeline beschleunigen.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="mailto:hello@uplanengine.de"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-accent hover:bg-accent-light text-white font-semibold px-10 py-4 rounded-xl transition-all shadow-lg shadow-accent/20 text-lg"
            >
              Demo anfragen
            </motion.a>
            <a
              href="mailto:hello@uplanengine.de"
              className="border border-gray-border text-slate-text font-semibold px-10 py-4 rounded-xl hover:bg-white transition-all text-lg"
            >
              Kontakt aufnehmen
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mt-8 text-sm text-slate-text/40">
            Oder direkt per E-Mail: hello@uplanengine.de
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
