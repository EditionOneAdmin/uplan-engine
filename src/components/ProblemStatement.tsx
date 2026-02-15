"use client";

import { Clock, ClipboardList, EuroIcon } from "lucide-react";
import FadeIn from "./FadeIn";
import CountUp from "./CountUp";

const cards = [
  {
    icon: Clock,
    stat: 18,
    suffix: " Monate",
    prefix: "Ø ",
    text: "bis zur Baugenehmigung in deutschen Großstädten",
  },
  {
    icon: ClipboardList,
    stat: 62,
    suffix: "%",
    prefix: "",
    text: "aller Bauanträge erhalten Nachforderungen",
  },
  {
    icon: EuroIcon,
    stat: 45,
    suffix: "k €",
    prefix: "",
    text: "Kosten pro Monat Verzögerung im Durchschnitt",
  },
];

export default function ProblemStatement() {
  return (
    <section id="problem" className="py-24 md:py-32 bg-gray-bg px-6">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="max-w-2xl mx-auto mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/uplan-engine/images/problem-documents.jpg" alt="Bauantrags-Dokumente mit Nachforderungen" className="rounded-2xl shadow-lg w-full h-48 object-cover" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-primary text-center tracking-tight">
            Genehmigungsverfahren bremsen Ihre Pipeline.
          </h2>
        </FadeIn>
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div className="bg-white rounded-2xl p-8 border border-gray-border hover:shadow-lg transition-shadow">
                <card.icon className="w-10 h-10 text-accent mb-4" strokeWidth={1.5} />
                <div className="text-4xl font-extrabold text-primary">
                  <CountUp end={card.stat} suffix={card.suffix} prefix={card.prefix} />
                </div>
                <p className="mt-2 text-slate-text/70">{card.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
