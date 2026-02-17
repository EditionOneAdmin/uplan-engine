'use client';

import { motion } from 'framer-motion';

interface Props {
  currentZinssatz: number | null;
  currentIRR: number | null;
  currentDSCR: number | null;
  currentAnnuitaet: number | null;
  ekBedarf: number | null;
  fkVolumen: number | null;
  gesamtinvestition: number | null;
}

const fmtK = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return v.toFixed(0);
};

const fmtPct = (v: number) => `${v.toFixed(1)}%`;

const dscrColor = (d: number) => {
  if (d >= 1.3) return { emoji: '🟢', cls: 'text-green-600' };
  if (d >= 1.0) return { emoji: '🟡', cls: 'text-yellow-600' };
  return { emoji: '🔴', cls: 'text-red-600' };
};

export default function ZinsSensitivitaet({
  currentZinssatz,
  currentDSCR,
  currentAnnuitaet,
  fkVolumen,
}: Props) {
  const tilgung = 2; // default 2%

  if (currentZinssatz == null || fkVolumen == null || fkVolumen === 0) {
    return (
      <div className="text-xs text-gray-400 italic py-2">
        Nicht genug Daten für Sensitivitätsanalyse
      </div>
    );
  }

  // If we have currentAnnuitaet, derive implied Jahresmiete from currentDSCR
  // DSCR = Jahresmiete / Annuität => Jahresmiete = DSCR * Annuität
  const baseAnn = currentAnnuitaet ?? (fkVolumen * (currentZinssatz + tilgung)) / 100;
  const jahresmiete = currentDSCR != null && currentAnnuitaet != null
    ? currentDSCR * currentAnnuitaet
    : currentDSCR != null
      ? currentDSCR * baseAnn
      : null;

  const deltas = [-1, 0, 1, 2];
  const scenarios = deltas.map((d) => {
    const zins = currentZinssatz + d;
    const ann = (fkVolumen * (zins + tilgung)) / 100;
    const dscr = jahresmiete != null && ann > 0 ? jahresmiete / ann : null;
    return { label: d === 0 ? 'Aktuell' : `${d > 0 ? '+' : ''}${d}%`, zins, ann, dscr };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-x-auto"
    >
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left pr-3 py-1 font-medium">Zins</th>
            {scenarios.map((s) => (
              <th
                key={s.label}
                className={`text-right px-2 py-1 font-medium ${s.label === 'Aktuell' ? 'bg-gray-50 rounded' : ''}`}
              >
                {fmtPct(s.zins)}
                <span className="block text-[10px] text-gray-400 font-normal">{s.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-100">
            <td className="pr-3 py-1 text-gray-500">Annuität</td>
            {scenarios.map((s) => (
              <td
                key={s.label}
                className={`text-right px-2 py-1 tabular-nums ${s.label === 'Aktuell' ? 'bg-gray-50 font-semibold' : ''}`}
              >
                {fmtK(s.ann)} €
              </td>
            ))}
          </tr>
          {jahresmiete != null && (
            <tr className="border-t border-gray-100">
              <td className="pr-3 py-1 text-gray-500">DSCR</td>
              {scenarios.map((s) => {
                const dc = s.dscr != null ? dscrColor(s.dscr) : null;
                return (
                  <td
                    key={s.label}
                    className={`text-right px-2 py-1 tabular-nums ${s.label === 'Aktuell' ? 'bg-gray-50 font-semibold' : ''} ${dc?.cls ?? ''}`}
                  >
                    {s.dscr != null ? `${s.dscr.toFixed(2)} ${dc!.emoji}` : '—'}
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </motion.div>
  );
}
