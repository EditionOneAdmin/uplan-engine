"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "./FadeIn";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Garantiert U-Plan Engine eine Baugenehmigung?",
    a: "Nein. U-Plan Engine liefert eine fundierte, strukturierte und nachvollziehbare Grundlage für den Bauantrag. Die finale Verantwortung liegt beim bauvorlageberechtigten Entwurfsverfasser. Unser Ziel: weniger Nachforderungen, schnellere Bearbeitung, höhere Erstgenehmigungsquote.",
  },
  {
    q: "Wer trägt die Verantwortung für den Bauantrag?",
    a: "Die Verantwortung verbleibt beim bauvorlageberechtigten Entwurfsverfasser — wie bei jedem konventionellen Verfahren. U-Plan Engine unterstützt mit automatisierten Prüfungen, ersetzt aber nicht die fachliche Freigabe.",
  },
  {
    q: "Wie funktioniert der Rollout neuer Kommunen?",
    a: "Wir erschließen Kommunen in Clustern. Im MVP starten wir mit einem Bundesland und 10–20 Kommunen. Neue Kommunen werden über konfigurierbare Profile eingebunden — inklusive lokaler Satzungen und kommunenspezifischer Anforderungen.",
  },
  {
    q: "Welche Outputs liefert die Plattform?",
    a: "Pro Projekt erhalten Sie: einen Variantenvergleich (A/B/C mit Kennzahlen), einen Compliance Report (Ampel-System mit Quellen und Empfehlungen) und ein strukturiertes SubmitPack mit Checkliste je Kommune-Profil.",
  },
  {
    q: "Wie integriert sich U-Plan Engine in bestehende Prozesse?",
    a: "Über eine RESTful API und strukturierte Exporte (PDF, IFC, BCF). U-Plan Engine ergänzt Ihren bestehenden Workflow — kein Systemwechsel nötig. Rollen- und Rechtekonzept ermöglicht nahtlose Einbindung ins Team.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-primary group-hover:text-accent transition-colors pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-slate-text/40 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-slate-text/70 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-extrabold text-primary text-center tracking-tight">
            Häufige Fragen.
          </h2>
        </FadeIn>

        <div className="mt-12 bg-white rounded-2xl border border-gray-border p-2 md:p-4">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
