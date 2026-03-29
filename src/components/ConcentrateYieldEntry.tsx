import { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { yieldColor, today } from '../utils';

export function ConcentrateYieldEntry() {
  const { concData, saveConcEntry, deleteConcEntry, plantMetrics, savePlantMetrics, financialHistory, saveFinancialHistory, deleteFinancialHistory } = useAppContext();
  
  const [cDate, setCDate] = useState(today());
  const [cFtd, setCFtd] = useState('');
  const [cMtd, setCMtd] = useState('');
  const [cYtd, setCYtd] = useState('');
  const [scoreSavings, setScoreSavings] = useState(0);

  useEffect(() => {
    if (plantMetrics) {
      setScoreSavings(plantMetrics.scoreSavings || 0);
    }
  }, [plantMetrics]);

  const handleSaveConc = () => {
    if(!cDate) return alert('Date is required');
    saveConcEntry({ date: cDate, ftd: cFtd ? +cFtd : null, mtd: cMtd ? +cMtd : null, ytd: cYtd ? +cYtd : null, updatedAt: new Date().toISOString() });
    setCFtd(''); setCMtd(''); setCYtd('');
  };

  const handleSaveSaving = () => {
    const baseMetrics = plantMetrics || {
      bsti: '', doeEnv: '', aibqs: 0, qasScore: 100, scoreSavings: 0, sugarSaving: 0,
      capEoy: 'Green', capYtd: 'Green', capMicro: 'Green', capAnalytical: 'Green', capSensory: 'Green',
      updatedAt: new Date().toISOString()
    };
    savePlantMetrics({ ...baseMetrics, scoreSavings, updatedAt: new Date().toISOString() });
    
    // Save to history
    saveFinancialHistory({
      id: `conc_${Date.now()}`,
      type: 'conc',
      amount: scoreSavings,
      date: today(),
      updatedAt: new Date().toISOString()
    });
  };

  const fmtPct = (v: number | null) => v ? <span className={`${yieldColor(v)} font-condensed font-bold`}>{v.toFixed(2)}%</span> : <span className="text-text-dim">—</span>;

  const concHistory = financialHistory.filter(h => h.type === 'conc');

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Left Column: Conc. Yield Entry & Records */}
        <div className="space-y-6">
          <div className="bg-navy-card border border-border rounded-lg p-5">
            <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-teal mb-3.5 pb-2 border-b border-border">🧪 Concentrate Yield Data Entry</div>
            <div className="bg-teal/5 border border-teal/20 rounded-md p-[10px_12px] text-[10px] text-text-muted mb-3.5">Enter daily concentrate yield data. This data populates the Conc. Yield KPIs.</div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Date *</label><input type="date" className="finp" value={cDate} onChange={e => setCDate(e.target.value)} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Conc. FTD (%)</label><input type="number" step="0.01" className="finp" placeholder="e.g. 101.75" value={cFtd} onChange={e => setCFtd(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Conc. MTD (%)</label><input type="number" step="0.01" className="finp" placeholder="e.g. 101.00" value={cMtd} onChange={e => setCMtd(e.target.value)} /></div>
              <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium uppercase tracking-wider">Conc. YTD (%)</label><input type="number" step="0.01" className="finp" placeholder="e.g. 100.74" value={cYtd} onChange={e => setCYtd(e.target.value)} /></div>
            </div>
            
            <div className="flex gap-2.5 justify-end">
              <button className="border border-border bg-transparent text-text-muted rounded px-4 py-2 text-[11px] font-semibold cursor-pointer transition-all hover:border-accent hover:text-accent" onClick={() => {setCFtd(''); setCMtd(''); setCYtd('');}}>Clear</button>
              <button className="border-none bg-green text-white rounded px-4 py-2 text-[11px] font-bold uppercase tracking-widest cursor-pointer transition-all hover:bg-green/80 shadow-lg" onClick={handleSaveConc}>💾 Save Conc. Data</button>
            </div>
          </div>

          <div className="bg-navy-card border border-border rounded-lg p-5">
            <div className="text-[10px] text-text-muted font-bold mb-3 uppercase tracking-[1.5px] pb-2 border-b border-border">Recent Conc. Yield Records</div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="dt">
                <thead><tr><th>Date</th><th>FTD %</th><th>MTD %</th><th>YTD %</th><th>Action</th></tr></thead>
                <tbody>
                  {concData.length ? concData.slice(0,50).map(r => (
                    <tr key={r.date}>
                      <td>{r.date}</td><td>{fmtPct(r.ftd)}</td><td>{fmtPct(r.mtd)}</td><td>{fmtPct(r.ytd)}</td>
                      <td><button className="border-none bg-red text-white rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all hover:bg-red/80" onClick={() => deleteConcEntry(r.date)}>✕</button></td>
                    </tr>
                  )) : <tr><td colSpan={5} className="text-center text-text-dim p-5 text-[10px]">No conc. records yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Performance Entry & Record */}
        <div className="space-y-6">
          <div className="bg-navy-card border border-border rounded-lg p-5">
            <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-accent mb-3.5 pb-2 border-b border-border">💰 Financial Performance</div>
            <div className="bg-accent/5 border border-accent/20 rounded-md p-[10px_12px] text-[10px] text-text-muted mb-3.5">Update the cumulative concentrate saving value for the current financial year.</div>
            
            <div className="flex items-end gap-3 bg-navy/30 p-4 rounded-lg border border-border/50">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Conc. Saving YTD (৳)</label>
                <input type="number" className="finp text-lg" value={scoreSavings} onChange={e => setScoreSavings(+e.target.value)} />
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
                  {concHistory.length ? concHistory.map(h => (
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
