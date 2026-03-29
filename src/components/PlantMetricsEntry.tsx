import { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { PlantMetrics } from '../types';

export function PlantMetricsEntry() {
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
      const mapColor = (v: any) => typeof v === 'number' ? 'Green' : String(v || 'Green');
      setPm({
        ...plantMetrics,
        capEoy: mapColor(plantMetrics.capEoy),
        capYtd: mapColor(plantMetrics.capYtd),
        capMicro: mapColor(plantMetrics.capMicro),
        capAnalytical: mapColor(plantMetrics.capAnalytical),
        capSensory: mapColor(plantMetrics.capSensory),
      });
    }
  }, [plantMetrics]);

  const handleSavePlantMetrics = () => {
    savePlantMetrics({ ...pm, updatedAt: new Date().toISOString() });
  };

  const ColorSelect = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-text-muted font-medium">{label}</label>
      <select className="finp" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">—</option>
        <option value="Blue">Blue</option>
        <option value="Green">Green</option>
        <option value="Yellow">Yellow</option>
        <option value="Red">Red</option>
      </select>
    </div>
  );

  return (
    <div className="p-6">
      <div className="bg-navy-card border border-border rounded-lg p-5 max-w-5xl mx-auto">
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-amber mb-4 pb-2 border-b border-border flex items-center gap-2">
          🏭 3C Score & Capability
        </div>
        <div className="bg-amber/5 border border-amber/20 rounded-md p-3 text-[10px] text-text-muted mb-6">
          Manage plant capability ratings and 3C (Control & Consumer) scores.
        </div>
        
        <div className="text-[11px] text-text-muted font-bold mb-3 uppercase tracking-[1px] border-b border-border pb-1">Plant Capability</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <ColorSelect label="EOY" value={pm.capEoy} onChange={v => setPm({...pm, capEoy: v})} />
          <ColorSelect label="YTD" value={pm.capYtd} onChange={v => setPm({...pm, capYtd: v})} />
          <ColorSelect label="Micro" value={pm.capMicro} onChange={v => setPm({...pm, capMicro: v})} />
          <ColorSelect label="Analytical" value={pm.capAnalytical} onChange={v => setPm({...pm, capAnalytical: v})} />
          <ColorSelect label="Sensory" value={pm.capSensory} onChange={v => setPm({...pm, capSensory: v})} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="text-[11px] text-text-muted font-bold mb-3 uppercase tracking-[1px] border-b border-border pb-1">3C Score (Control)</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W EOY</label><input type="number" className="finp" value={pm.ctrl12Eoy} onChange={e => setPm({...pm, ctrl12Eoy: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W YTD</label><input type="number" className="finp" value={pm.ctrl12Ytd} onChange={e => setPm({...pm, ctrl12Ytd: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W FG</label><input type="number" className="finp" value={pm.ctrl12Fg} onChange={e => setPm({...pm, ctrl12Fg: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W IW</label><input type="number" className="finp" value={pm.ctrl12Iw} onChange={e => setPm({...pm, ctrl12Iw: +e.target.value})} /></div>
              
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30"><label className="text-[9px] text-text-muted font-bold uppercase">6W EOY</label><input type="number" className="finp" value={pm.ctrl6Eoy} onChange={e => setPm({...pm, ctrl6Eoy: +e.target.value})} /></div>
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30"><label className="text-[9px] text-text-muted font-bold uppercase">6W YTD</label><input type="number" className="finp" value={pm.ctrl6Ytd} onChange={e => setPm({...pm, ctrl6Ytd: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">6W FG</label><input type="number" className="finp" value={pm.ctrl6Fg} onChange={e => setPm({...pm, ctrl6Fg: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">6W IW</label><input type="number" className="finp" value={pm.ctrl6Iw} onChange={e => setPm({...pm, ctrl6Iw: +e.target.value})} /></div>
              
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30"><label className="text-[9px] text-text-muted font-bold uppercase">1W EOY</label><input type="number" className="finp" value={pm.ctrl1Eoy} onChange={e => setPm({...pm, ctrl1Eoy: +e.target.value})} /></div>
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30"><label className="text-[9px] text-text-muted font-bold uppercase">1W YTD</label><input type="number" className="finp" value={pm.ctrl1Ytd} onChange={e => setPm({...pm, ctrl1Ytd: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">1W FG</label><input type="number" className="finp" value={pm.ctrl1Fg} onChange={e => setPm({...pm, ctrl1Fg: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">1W IW</label><input type="number" className="finp" value={pm.ctrl1Iw} onChange={e => setPm({...pm, ctrl1Iw: +e.target.value})} /></div>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-text-muted font-bold mb-3 uppercase tracking-[1px] border-b border-border pb-1">3C Score (Consumer)</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W EOY</label><input type="number" className="finp" value={pm.cons12Eoy} onChange={e => setPm({...pm, cons12Eoy: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W YTD</label><input type="number" className="finp" value={pm.cons12Ytd} onChange={e => setPm({...pm, cons12Ytd: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W Sensory</label><input type="number" className="finp" value={pm.cons12Sensory} onChange={e => setPm({...pm, cons12Sensory: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W Torque</label><input type="number" className="finp" value={pm.cons12Torque} onChange={e => setPm({...pm, cons12Torque: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">12W PA</label><input type="number" className="finp" value={pm.cons12Pa} onChange={e => setPm({...pm, cons12Pa: +e.target.value})} /></div>
              
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30"><label className="text-[9px] text-text-muted font-bold uppercase">6W EOY</label><input type="number" className="finp" value={pm.cons6Eoy} onChange={e => setPm({...pm, cons6Eoy: +e.target.value})} /></div>
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30"><label className="text-[9px] text-text-muted font-bold uppercase">6W YTD</label><input type="number" className="finp" value={pm.cons6Ytd} onChange={e => setPm({...pm, cons6Ytd: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">6W Sensory</label><input type="number" className="finp" value={pm.cons6Sensory} onChange={e => setPm({...pm, cons6Sensory: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">6W Torque</label><input type="number" className="finp" value={pm.cons6Torque} onChange={e => setPm({...pm, cons6Torque: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">6W PA</label><input type="number" className="finp" value={pm.cons6Pa} onChange={e => setPm({...pm, cons6Pa: +e.target.value})} /></div>
              
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30"><label className="text-[9px] text-text-muted font-bold uppercase">1W EOY</label><input type="number" className="finp" value={pm.cons1Eoy} onChange={e => setPm({...pm, cons1Eoy: +e.target.value})} /></div>
              <div className="flex flex-col gap-1 pt-2 border-t border-border/30"><label className="text-[9px] text-text-muted font-bold uppercase">1W YTD</label><input type="number" className="finp" value={pm.cons1Ytd} onChange={e => setPm({...pm, cons1Ytd: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">1W Sensory</label><input type="number" className="finp" value={pm.cons1Sensory} onChange={e => setPm({...pm, cons1Sensory: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">1W Torque</label><input type="number" className="finp" value={pm.cons1Torque} onChange={e => setPm({...pm, cons1Torque: +e.target.value})} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-bold uppercase">1W PA</label><input type="number" className="finp" value={pm.cons1Pa} onChange={e => setPm({...pm, cons1Pa: +e.target.value})} /></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button className="border-none bg-amber text-white rounded px-8 py-2.5 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-amber/80 shadow-lg" onClick={handleSavePlantMetrics}>💾 Save 3C & Capability Data</button>
        </div>
      </div>
    </div>
  );
}
