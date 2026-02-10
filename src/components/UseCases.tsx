"use client";

import FadeIn from "./FadeIn";
import { BarChart3, Clock, Repeat } from "lucide-react";

const cases = [
  {
    icon: BarChart3,
    title: "Portfolio-Rollout",
    desc: "Bewerten Sie 50 Standorte in der Zeit, die Sie heute für 5 brauchen. Gleiche Standards, konsistente Qualität über alle Projekte hinweg.",
    highlight: "10x schnellere Standortbewertung",
    image: "/bplan-engine/images/usecase-portfolio.png",
  },
  {
    icon: Clock,
    title: "Ankaufsprüfung in 48h",
    desc: "Machbarkeit prüfen bevor der Letter of Intent unterschrieben ist. Fundierte Entscheidung statt Bauchgefühl — datenbasiert und nachvollziehbar.",
    highlight: "Von Wochen auf Stunden",
    image: "/bplan-engine/images/usecase-ankauf.png",
  },
  {
    icon: Repeat,
    title: "Serielle Planung mit Standards",
    desc: "Bewährte Gebäudestandards wiederverwenden. Weniger Entwurfsaufwand, schnellere Freigaben, geringere Planungskosten bei gleichbleibender Qualität.",
    highlight: "Bis zu 60% weniger Planungsaufwand",
    image: "/bplan-engine/images/usecase-seriell.png",
  },
];

export default function UseCases() {
  return (
    <section className="py-20 md:py-32 px-6 bg-gray-bg">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary text-center tracking-tight">
            Für jeden Anwendungsfall.
          </h2>
        </FadeIn>

        <div className="mt-16 space-y-8 max-w-4xl mx-auto">
          {cases.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.1}>
              <div className="bg-white rounded-2xl border border-gray-border overflow-hidden hover:shadow-lg transition-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.title} className="w-full h-48 object-cover" />
                <div className="p-8 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <c.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary">{c.title}</h3>
                  <p className="mt-2 text-slate-text/70 leading-relaxed">{c.desc}</p>
                  <span className="inline-block mt-3 text-sm font-semibold text-accent bg-accent/5 px-3 py-1 rounded-full">
                    {c.highlight}
                  </span>
                </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
