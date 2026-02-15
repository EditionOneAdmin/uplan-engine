"use client";

import { regions, regionIds } from "../../config/regions";

interface Props {
  selectedRegion: string;
  onChange: (regionId: string) => void;
}

export function RegionSelector({ selectedRegion, onChange }: Props) {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 1000,
      }}
    >
      <select
        value={selectedRegion}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "6px 28px 6px 10px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(15,23,42,0.9)",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M3 5l3 3 3-3'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
        }}
      >
        {regionIds.map((id) => (
          <option key={id} value={id} style={{ background: "#0F172A" }}>
            {regions[id].name}
          </option>
        ))}
      </select>
    </div>
  );
}
