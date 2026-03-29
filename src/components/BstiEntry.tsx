import { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { PlantMetrics } from '../types';

export function BstiEntry() {
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
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-green mb-4 pb-2 border-b border-border flex items-center gap-2">
          📜 BSTI Certifications
        </div>
        
        <div className="mb-6">
          <div className="flex flex-col gap-1 mb-4 max-w-[240px]">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Last BSTI Visit</label>
            <input type="date" className="finp" value={pm.lastBstiVisit || ''} onChange={e => setPm({...pm, lastBstiVisit: e.target.value})} />
          </div>

          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 mb-2 px-2">
            <div className="text-[9px] text-text-muted font-bold uppercase">Certificate Name</div>
            <div className="text-[9px] text-text-muted font-bold uppercase">Done Date</div>
            <div className="text-[9px] text-text-muted font-bold uppercase">Due Date</div>
            <div></div>
          </div>

          <div className="space-y-3">
            {(pm.bstiList || []).map((item, i) => {
              const isExpired = item.dueDate ? new Date() > new Date(item.dueDate) : false;
              return (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center bg-navy/30 p-3 rounded-md border border-border/50">
                  <input type="text" className="finp" placeholder="e.g. BDS 1123:2022 (CSD)" value={item.name} onChange={e => {
                    const newList = [...(pm.bstiList || [])];
                    newList[i] = { ...newList[i], name: e.target.value };
                    setPm({...pm, bstiList: newList});
                  }} />
                  <input type="date" className="finp" value={item.doneDate} onChange={e => {
                    const newList = [...(pm.bstiList || [])];
                    newList[i] = { ...newList[i], doneDate: e.target.value };
                    setPm({...pm, bstiList: newList});
                  }} />
                  <div className="flex items-center gap-2">
                    <input type="date" className="finp flex-1" value={item.dueDate} onChange={e => {
                      const newList = [...(pm.bstiList || [])];
                      newList[i] = { ...newList[i], dueDate: e.target.value };
                      setPm({...pm, bstiList: newList});
                    }} />
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${isExpired ? 'bg-red/10 text-red' : 'bg-green/10 text-green'}`}>
                      {isExpired ? 'Expired' : 'Valid'}
                    </span>
                  </div>
                  <button className="border-none bg-red/20 text-red rounded w-8 h-8 flex items-center justify-center font-bold cursor-pointer transition-all hover:bg-red hover:text-white" onClick={() => {
                    const newList = [...(pm.bstiList || [])];
                    newList.splice(i, 1);
                    setPm({...pm, bstiList: newList});
                  }}>✕</button>
                </div>
              );
            })}
          </div>

          <button className="border border-dashed border-border bg-transparent text-text-muted rounded w-full py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:border-accent hover:text-accent mt-4" onClick={() => {
            setPm({...pm, bstiList: [...(pm.bstiList || []), { name: '', doneDate: '', dueDate: '' }]});
          }}>+ Add BSTI Certification</button>
        </div>

        <div className="flex justify-end mt-6">
          <button className="border-none bg-green text-white rounded px-6 py-2 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-green/80 shadow-lg" onClick={handleSave}>💾 Save BSTI Data</button>
        </div>
      </div>
    </div>
  );
}
