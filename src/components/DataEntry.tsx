import { useState } from 'react';
import { SugarYieldEntry } from './SugarYieldEntry';
import { ConcentrateYieldEntry } from './ConcentrateYieldEntry';
import { DFConsumptionEntry } from './DFConsumptionEntry';
import { ExtLabEntry } from './ExtLabEntry';
import { PlantMetricsEntry } from './PlantMetricsEntry';
import { AibQsEntry } from './AibQsEntry';
import { BstiEntry } from './BstiEntry';
import { DoeEntry } from './DoeEntry';
import { DashboardPreview } from './DashboardPreview';

export function DataEntry() {
  const [activeTab, setActiveTab] = useState('sugar');

  const tabs = [
    { id: 'sugar', label: '🍬 Sugar Yield' },
    { id: 'conc', label: '🧪 Conc. Yield' },
    { id: 'df', label: '💧 DF Consumption' },
    { id: 'extLab', label: '🔬 External Lab' },
    { id: 'aib', label: '🏆 AIB & QAS' },
    { id: 'bsti', label: '📜 BSTI Certs' },
    { id: 'doe', label: '🌍 Env. DOE' },
    { id: 'plantMetrics', label: '🏭 3C Score' },
  ];

  return (
    <div className="flex h-full bg-[#0a0e17]">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-navy-mid border-b border-border px-6 pt-4 flex gap-6 shrink-0 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto bg-navy/10">
          {activeTab === 'sugar' && <SugarYieldEntry />}
          {activeTab === 'conc' && <ConcentrateYieldEntry />}
          {activeTab === 'df' && <DFConsumptionEntry />}
          {activeTab === 'extLab' && <ExtLabEntry />}
          {activeTab === 'aib' && <AibQsEntry />}
          {activeTab === 'bsti' && <BstiEntry />}
          {activeTab === 'doe' && <DoeEntry />}
          {activeTab === 'plantMetrics' && <PlantMetricsEntry />}
        </div>
      </div>
      <DashboardPreview />
    </div>
  );
}
