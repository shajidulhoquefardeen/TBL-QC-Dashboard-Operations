import { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { PlantMetrics } from '../types';

export function AibQsEntry() {
  const { plantMetrics, savePlantMetrics } = useAppContext();
  const [pm, setPm] = useState<PlantMetrics>({
    bsti: '', doeEnv: '', aibqs: 0, qasScore: 100, scoreSavings: 0, sugarSaving: 0,
    capEoy: 'Green', capYtd: 'Green', capMicro: 'Green', capAnalytical: 'Green', capSensory: 'Green',
    aibYearly: [],
    ctrl12Eoy: 0, ctrl12Ytd: 0, ctrl12Fg: 0, ctrl12Iw: 0,
    ctrl6Eoy: 0, ctrl6Ytd: 0, ctrl6Fg: 0, ctrl6Iw: 0,
    ctrl1Eoy: 0, ctrl1Ytd: 0, ctrl1Fg: 0, ctrl1Iw: 0,
    cons12Eoy: 0, cons12Ytd: 0, cons12Sensory: 0, cons12Torque: 0, cons12Pa: 0,
    cons6Eoy: 0, cons6Ytd: 0, cons6Sensory: 0, cons6Torque: 0, cons6Pa: 0,
    cons1Eoy: 0, cons1Ytd: 0, cons1Sensory: 0, cons1Torque: 0, cons1Pa: 0,
    updatedAt: ''
  });

  useEffect(() => {
    if (plantMetrics) {
      setPm(plantMetrics);
    }
  }, [plantMetrics]);

  const handleSave = () => {
    savePlantMetrics({ ...pm, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="p-6">
      <div className="bg-navy-card border border-border rounded-lg p-5 max-w-4xl mx-auto">
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-accent mb-4 pb-2 border-b border-border flex items-center gap-2">
          🏆 AIB & QAS Scores
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">AIB Score</label>
            <input type="number" className="finp" value={pm.aibqs} onChange={e => setPm({...pm, aibqs: +e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">QAS Score</label>
            <input type="number" className="finp" value={pm.qasScore || 0} onChange={e => setPm({...pm, qasScore: +e.target.value})} />
          </div>
        </div>

        <div className="text-[11px] text-text-muted font-bold mb-3 uppercase tracking-widest border-b border-border pb-1">AIB Yearly Trend</div>
        <div className="mb-4">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4 mb-2 px-2">
            <div className="text-[9px] text-text-muted font-bold uppercase">Year</div>
            <div className="text-[9px] text-text-muted font-bold uppercase">Score</div>
            <div></div>
          </div>
          <div className="flex flex-col gap-2">
            {(pm.aibYearly || []).map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center bg-navy/30 p-2 rounded-md border border-border/50">
                <input type="text" className="finp" value={item.year} onChange={e => {
                  const newAib = [...(pm.aibYearly || [])];
                  newAib[i] = { ...newAib[i], year: e.target.value };
                  setPm({...pm, aibYearly: newAib});
                }} />
                <input type="number" className="finp" value={item.score} onChange={e => {
                  const newAib = [...(pm.aibYearly || [])];
                  newAib[i] = { ...newAib[i], score: +e.target.value };
                  setPm({...pm, aibYearly: newAib});
                }} />
                <button className="border-none bg-red/20 text-red rounded w-8 h-8 flex items-center justify-center font-bold cursor-pointer transition-all hover:bg-red/30" onClick={() => {
                  const newAib = [...(pm.aibYearly || [])];
                  newAib.splice(i, 1);
                  setPm({...pm, aibYearly: newAib});
                }}>✕</button>
              </div>
            ))}
          </div>
          <button className="border border-dashed border-border bg-transparent text-text-muted rounded w-full py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:bg-navy/50 hover:text-text mt-3" onClick={() => {
            setPm({...pm, aibYearly: [...(pm.aibYearly || []), { year: new Date().getFullYear().toString(), score: 0 }]});
          }}>+ Add Yearly Score</button>
        </div>

        <div className="flex justify-end mt-6">
          <button className="border-none bg-accent text-white rounded px-6 py-2 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-accent/80 shadow-lg" onClick={handleSave}>💾 Save AIB & QAS Data</button>
        </div>
      </div>
    </div>
  );
}
