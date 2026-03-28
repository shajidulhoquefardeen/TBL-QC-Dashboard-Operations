import { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { yieldColor, today } from '../utils';

export function SugarYieldEntry() {
  const { sugarData, saveSugarEntry, deleteSugarEntry, plantMetrics, savePlantMetrics, financialHistory, saveFinancialHistory, deleteFinancialHistory } = useAppContext();
  
  const [sDate, setSDate] = useState(today());
  const [sFtd, setSFtd] = useState('');
  const [sMtd, setSMtd] = useState('');
  const [sYtd, setSYtd] = useState('');
  const [sugarSaving, setSugarSaving] = useState(0);

  useEffect(() => {
    if (plantMetrics) {
      setSugarSaving(plantMetrics.sugarSaving || 0);
    }
  }, [plantMetrics]);

  const handleSaveSugar = () => {
    if(!sDate) return alert('Date is required');
    saveSugarEntry({ date: sDate, ftd: sFtd ? +sFtd : null, mtd: sMtd ? +sMtd : null, ytd: sYtd ? +sYtd : null, updatedAt: new Date().toISOString() });
    setSFtd(''); setSMtd(''); setSYtd('');
  };

  const handleSaveSaving = () => {
    const baseMetrics = plantMetrics || {
      bsti: '', doeEnv: '', aibqs: 0, qasScore: 100, scoreSavings: 0, sugarSaving: 0,
      capEoy: 'Green', capYtd: 'Green', capMicro: 'Green', capAnalytical: 'Green', capSensory: 'Green',
      updatedAt: new Date().toISOString()
    };
    savePlantMetrics({ ...baseMetrics, sugarSaving, updatedAt: new Date().toISOString() });
    
    // Save to history
    saveFinancialHistory({
      id: `sugar_${Date.now()}`,
      type: 'sugar',
      amount: sugarSaving,
      date: today(),
      updatedAt: new Date().toISOString()
    });
  };

  const fmtPct = (v: number | null) => v ? <span className={`${yieldColor(v)} font-condensed font-bold`}>{v.toFixed(2)}%</span> : <span className="text-text-dim">—</span>;

  const sugarHistory = financialHistory.filter(h => h.type === 'sugar');

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Left Column: Sugar Yield Entry & Records */}
        <div className="space-y-6">
          <div className="bg-navy-card border border-border rounded-lg p-5">
            <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-green mb-3.5 pb-2 border-b border-border">🍬 Sugar Yield Data Entry</div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-md p-[10px_12px] text-[10px] text-text-muted mb-3.5">Enter daily sugar yield data from the syrup preparation area.</div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Date *</label><input type="date" className="finp" value={sDate} onChange={e => setSDate(e.target.value)} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Sugar FTD (%)</label><input type="number" step="0.01" className="finp" placeholder="e.g. 101.18" value={sFtd} onChange={e => setSFtd(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Sugar MTD (%)</label><input type="number" step="0.01" className="finp" placeholder="e.g. 99.70" value={sMtd} onChange={e => setSMtd(e.target.value)} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Sugar YTD (%)</label><input type="number" step="0.01" className="finp" placeholder="e.g. 98.70" value={sYtd} onChange={e => setSYtd(e.target.value)} /></div>
            </div>
            
            <div className="flex gap-2.5 justify-end">
              <button className="border border-border bg-transparent text-text-muted rounded px-4 py-2 text-[11px] font-semibold cursor-pointer transition-all hover:border-accent hover:text-accent" onClick={() => {setSFtd(''); setSMtd(''); setSYtd('');}}>Clear</button>
              <button className="border-none bg-green text-white rounded px-4 py-2 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-green-400 shadow-lg" onClick={handleSaveSugar}>💾 Save Sugar Data</button>
            </div>
          </div>

          <div className="bg-navy-card border border-border rounded-lg p-5">
            <div className="text-[10px] text-text-muted font-bold mb-3 uppercase tracking-[1.5px] pb-2 border-b border-border">Recent Sugar Yield Records</div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="dt">
                <thead><tr><th>Date</th><th>FTD %</th><th>MTD %</th><th>YTD %</th><th>Action</th></tr></thead>
                <tbody>
                  {sugarData.length ? sugarData.slice(0,50).map(r => (
                    <tr key={r.date}>
                      <td>{r.date}</td><td>{fmtPct(r.ftd)}</td><td>{fmtPct(r.mtd)}</td><td>{fmtPct(r.ytd)}</td>
                      <td><button className="border-none bg-red text-white rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all hover:bg-red-600" onClick={() => deleteSugarEntry(r.date)}>✕</button></td>
                    </tr>
                  )) : <tr><td colSpan={5} className="text-center text-text-dim p-5 text-[10px]">No sugar records yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Performance Entry & Record */}
        <div className="space-y-6">
          <div className="bg-navy-card border border-border rounded-lg p-5">
            <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-accent mb-3.5 pb-2 border-b border-border">💰 Financial Performance</div>
            <div className="bg-accent/5 border border-accent/20 rounded-md p-[10px_12px] text-[10px] text-text-muted mb-3.5">Update the cumulative sugar saving value for the current financial year.</div>
            
            <div className="flex items-end gap-3 bg-navy/30 p-4 rounded-lg border border-border/50">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Sugar Saving YTD (৳)</label>
                <input type="number" className="finp text-lg" value={sugarSaving} onChange={e => setSugarSaving(+e.target.value)} />
              </div>
              <button className="border-none bg-accent text-white rounded px-6 py-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-accent/80 shadow-lg" onClick={handleSaveSaving}>Update Saving</button>
            </div>
          </div>

          <div className="bg-navy-card border border-border rounded-lg p-5">
            <div className="text-[10px] text-text-muted font-bold mb-3 uppercase tracking-[1.5px] pb-2 border-b border-border">Financial Performance Record</div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="dt">
                <thead><tr><th>Update Date</th><th>Amount (৳)</th><th>Action</th></tr></thead>
                <tbody>
                  {sugarHistory.length ? sugarHistory.map(h => (
                    <tr key={h.id}>
                      <td className="text-[10px]">{new Date(h.updatedAt).toLocaleString()}</td>
                      <td className="font-mono font-bold text-accent">৳ {h.amount.toLocaleString()}</td>
                      <td>
                        <button className="border-none bg-red/20 text-red rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all hover:bg-red hover:text-white" onClick={() => deleteFinancialHistory(h.id)}>✕</button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={3} className="text-center text-text-dim p-5 text-[10px]">No history records yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
