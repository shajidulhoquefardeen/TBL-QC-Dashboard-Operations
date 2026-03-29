import { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { PlantMetrics } from '../types';

export function DoeEntry() {
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
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-teal-400 mb-4 pb-2 border-b border-border flex items-center gap-2">
          🌍 Environment (DOE)
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-2 p-4 bg-navy/30 rounded-lg border border-border/50">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Q1 Sampling & Date</label>
            <input type="date" className="finp" value={pm.doeEnvDetails?.samplingQ1 || ''} onChange={e => setPm({...pm, doeEnvDetails: { ...(pm.doeEnvDetails || { samplingQ1: '', samplingQ2: '', licenceExpiry: '' }), samplingQ1: e.target.value }})} />
          </div>
          <div className="flex flex-col gap-2 p-4 bg-navy/30 rounded-lg border border-border/50">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Q2 Sampling & Date</label>
            <input type="date" className="finp" value={pm.doeEnvDetails?.samplingQ2 || ''} onChange={e => setPm({...pm, doeEnvDetails: { ...(pm.doeEnvDetails || { samplingQ1: '', samplingQ2: '', licenceExpiry: '' }), samplingQ2: e.target.value }})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-2 p-4 bg-navy/30 rounded-lg border border-border/50">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Date of the Licence Expiry</label>
            <input type="date" className="finp" value={pm.doeEnvDetails?.licenceExpiry || ''} onChange={e => setPm({...pm, doeEnvDetails: { ...(pm.doeEnvDetails || { samplingQ1: '', samplingQ2: '', licenceExpiry: '' }), licenceExpiry: e.target.value }})} />
          </div>
          <div className="flex flex-col gap-2 p-4 bg-navy/30 rounded-lg border border-border/50 justify-center">
            <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-1">Licence Status</label>
            {pm.doeEnvDetails?.licenceExpiry ? (
              <div className={`text-[11px] font-black uppercase px-4 py-2 rounded shadow-inner text-center ${new Date() > new Date(pm.doeEnvDetails.licenceExpiry) ? 'bg-red/20 text-red border border-red/30' : 'bg-green/20 text-green border border-green/30'}`}>
                {new Date() > new Date(pm.doeEnvDetails.licenceExpiry) ? '⚠️ Licence Expired' : '✅ Licence Valid'}
              </div>
            ) : (
              <div className="text-[11px] font-bold uppercase px-4 py-2 rounded bg-navy/50 text-text-muted border border-border/30 text-center italic">
                No Date Set
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button className="border-none bg-teal-600 text-white rounded px-6 py-2 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-teal-500 shadow-lg" onClick={handleSave}>💾 Save DOE Data</button>
        </div>
      </div>
    </div>
  );
}
