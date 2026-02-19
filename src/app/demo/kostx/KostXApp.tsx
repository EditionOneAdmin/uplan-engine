'use client';

import { useReducer, useMemo, useState, useCallback } from 'react';
import type { KostXConfig, KostXResult } from './engine/kostx-types';
import { KOSTX_DEFAULTS } from './engine/kostx-defaults';
import { calculateKostX } from './engine/kostx-engine';

import BuildingBasics from './components/BuildingBasics';
import CostFactors from './components/CostFactors';
import FacadeConfig from './components/FacadeConfig';
import TechConfig from './components/TechConfig';
import RoofConfig from './components/RoofConfig';
// EconomicsConfig removed — Wirtschaftlichkeit lives in CostCalculator
import SectionHeader from './components/SectionHeader';
import CostSummary from './components/CostSummary';
import CostBreakdown from './components/CostBreakdown';
import MassDisplay from './components/MassDisplay';
import WaterfallChart from './components/WaterfallChart';
import DetailTable from './components/DetailTable';
import HonorarDisplay from './components/HonorarDisplay';
import TiefgarageDisplay from './components/TiefgarageDisplay';
import KostenaufstellungView from './components/KostenaufstellungView';

type Action = { type: 'patch'; payload: Partial<KostXConfig> } | { type: 'reset' };

function reducer(state: KostXConfig, action: Action): KostXConfig {
  switch (action.type) {
    case 'patch': return { ...state, ...action.payload };
    case 'reset': return KOSTX_DEFAULTS;
    default: return state;
  }
}

const TABS = [
  { key: 'overview', label: 'Übersicht' },
  { key: 'detail', label: 'KG Detail' },
  { key: 'kostenaufstellung', label: 'Kostenaufstellung' },
  { key: 'honorare', label: 'Honorare' },
  { key: 'tiefgarage', label: 'Tiefgarage' },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function KostXApp() {
  const [config, dispatch] = useReducer(reducer, KOSTX_DEFAULTS);
  const [sections, setSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const toggle = useCallback((key: string) => {
    setSections(p => ({ ...p, [key]: !p[key] }));
  }, []);

  const onChange = useCallback((patch: Partial<KostXConfig>) => {
    dispatch({ type: 'patch', payload: patch });
  }, []);

  const result: KostXResult = useMemo(() => calculateKostX(config), [config]);

  const hasTG = result.basement?.tiefgarageResult != null;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Header */}
      <header className="bg-[#1E293B] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/uplan-engine/demo" className="text-white/40 hover:text-white/60 text-xs">← Zurück</a>
          <h1 className="text-sm font-bold text-teal-400">KostX</h1>
          <span className="text-xs text-white/40">Kostenrechner</span>
        </div>
        <button
          onClick={() => dispatch({ type: 'reset' })}
          className="text-xs text-white/40 hover:text-white/60 border border-white/10 rounded px-2 py-1"
        >
          Zurücksetzen
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="lg:w-[35%] xl:w-[30%] bg-[#151528] border-r border-white/10 lg:h-[calc(100vh-49px)] overflow-y-auto">
          <BuildingBasics config={config} onChange={onChange} />

          <div className="border-t border-white/10">
            <SectionHeader title="Kostenfaktoren" icon="💰" isOpen={!!sections.cost} onToggle={() => toggle('cost')} />
            <div className={`overflow-hidden transition-all duration-200 ${sections.cost ? 'max-h-[1000px]' : 'max-h-0'}`}>
              <CostFactors config={config} onChange={onChange} />
            </div>
          </div>

          <div className="border-t border-white/10">
            <SectionHeader title="Fassade & Balkone" icon="🏢" isOpen={!!sections.facade} onToggle={() => toggle('facade')} />
            <div className={`overflow-hidden transition-all duration-200 ${sections.facade ? 'max-h-[1000px]' : 'max-h-0'}`}>
              <FacadeConfig config={config} onChange={onChange} />
            </div>
          </div>

          <div className="border-t border-white/10">
            <SectionHeader title="Gebäudetechnik" icon="⚡" isOpen={!!sections.tech} onToggle={() => toggle('tech')} />
            <div className={`overflow-hidden transition-all duration-200 ${sections.tech ? 'max-h-[1000px]' : 'max-h-0'}`}>
              <TechConfig config={config} onChange={onChange} />
            </div>
          </div>

          <div className="border-t border-white/10">
            <SectionHeader title="Dach" icon="🏠" isOpen={!!sections.roof} onToggle={() => toggle('roof')} />
            <div className={`overflow-hidden transition-all duration-200 ${sections.roof ? 'max-h-[1000px]' : 'max-h-0'}`}>
              <RoofConfig config={config} onChange={onChange} />
            </div>
          </div>

          {/* Wirtschaftlichkeit section removed — lives in CostCalculator */}
        </aside>

        {/* Results */}
        <main className="flex-1 lg:h-[calc(100vh-49px)] overflow-y-auto">
          <CostSummary result={result} />

          {/* Tabs */}
          <div className="border-b border-white/10 px-4 flex gap-0 overflow-x-auto">
            {TABS.filter(t => t.key !== 'tiefgarage' || hasTG).map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === t.key
                    ? 'border-teal-400 text-teal-400'
                    : 'border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="divide-y divide-white/10">
            {activeTab === 'overview' && (
              <>
                <CostBreakdown result={result} />
                <MassDisplay result={result} />
                <WaterfallChart result={result} />
              </>
            )}
            {activeTab === 'detail' && (
              <DetailTable result={result} />
            )}
            {activeTab === 'kostenaufstellung' && (
              <KostenaufstellungView result={result} />
            )}
            {activeTab === 'honorare' && (
              <HonorarDisplay result={result} />
            )}
            {activeTab === 'tiefgarage' && hasTG && (
              <TiefgarageDisplay result={result} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
