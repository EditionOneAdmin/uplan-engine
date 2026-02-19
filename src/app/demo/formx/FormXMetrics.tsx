"use client";

import React from 'react';
import type { FormXMetrics as Metrics } from './types';

interface Props {
  metrics: Metrics;
  kostenPreview: { kg300_400: number; gik: number } | null;
}

function Row({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-white/60">{label}</span>
      <span className="text-white font-mono">
        {typeof value === 'number' ? value.toLocaleString('de-DE', { maximumFractionDigits: 1 }) : value}
        {unit && <span className="text-white/40 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export default function FormXMetrics({ metrics, kostenPreview }: Props) {
  const m = metrics;
  return (
    <div className="space-y-4">
      {/* Flächen */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Flächen</h3>
        <Row label="GR" value={m.grundflaeche} unit="m²" />
        <Row label="BGF oi" value={m.bgf} unit="m²" />
        <Row label="NUF R" value={m.nuf} unit="m²" />
        <Row label="AWF" value={m.awf} unit="m²" />
        <Row label="IWF" value={m.iwf} unit="m²" />
        <Row label="DAF" value={m.dachflaeche} unit="m²" />
        <Row label="FF" value={m.fensterflaeche} unit="m²" />
      </div>

      {/* Effizienz */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Effizienz</h3>
        <Row label="NUF/BGF" value={m.bgf > 0 ? `${((m.nuf / m.bgf) * 100).toFixed(0)}%` : '—'} />
        <Row label="Fassade/NUF" value={m.fassadeNuf.toFixed(2)} />
        <Row label="A/V" value={m.avVerhaeltnis.toFixed(3)} />
        <Row label="Kompaktheit" value={m.kompaktheit.toFixed(2)} />
      </div>

      {/* Gebäude */}
      <div>
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Gebäude</h3>
        <Row label="Höhe" value={m.hoehe} unit="m" />
        <Row label="GK" value={m.gebaeudeKlasse} />
        <Row label="WE" value={m.weAnzahl} />
        <Row label="Ø WE" value={m.weGroesse} unit="m²" />
        <Row label="Stellplätze" value={m.stellplaetze} />
      </div>

      {/* Kosten */}
      {kostenPreview && (
        <div>
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Kosten-Preview</h3>
          <Row label="KG 300+400" value={`${kostenPreview.kg300_400.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €/m² NUF`} />
          <Row label="GIK" value={`${kostenPreview.gik.toLocaleString('de-DE', { maximumFractionDigits: 0 })} €/m² NUF`} />
        </div>
      )}
    </div>
  );
}
