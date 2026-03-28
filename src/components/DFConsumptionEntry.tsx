import { useState } from 'react';
import { useAppContext } from '../store';
import { today } from '../utils';

export function DFConsumptionEntry() {
  const { dfData, saveDFEntry, deleteDFEntry } = useAppContext();
  
  const [dfMonth, setDfMonth] = useState(today().slice(0, 7)); // YYYY-MM
  const [dfAmount, setDfAmount] = useState('');

  const handleSaveDF = () => {
    if(!dfMonth || !dfAmount) return alert('Month and Amount are required');
    saveDFEntry({ month: dfMonth, amount: +dfAmount, updatedAt: new Date().toISOString() });
    setDfAmount('');
  };

  return (
    <div className="p-[18px_22px]">
      <div className="bg-navy-card border border-border rounded-lg p-3.5 max-w-2xl mx-auto">
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-cyan-400 mb-3.5 pb-2 border-b border-border">💧 DF Consumption Data Entry</div>
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-md p-[10px_12px] text-[10px] text-text-muted mb-3.5">Enter monthly DF consumption data. This populates the DF Consumption chart on the QC Dashboard.</div>
        
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium">Month *</label><input type="month" className="finp" value={dfMonth} onChange={e => setDfMonth(e.target.value)} /></div>
          <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium">Amount (Kg) *</label><input type="number" className="finp" placeholder="e.g. 2415" value={dfAmount} onChange={e => setDfAmount(e.target.value)} /></div>
        </div>
        
        <div className="flex gap-2.5 justify-end">
          <button className="border-none bg-cyan-600 text-white rounded px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all hover:bg-cyan-500" onClick={handleSaveDF}>💾 Save DF Data</button>
        </div>

        <div className="mt-4 pt-3.5 border-t border-border">
          <div className="text-[10px] text-text-muted font-semibold mb-2 uppercase tracking-[1px]">Recent DF Records</div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="dt">
              <thead><tr><th>Month</th><th>Amount (Kg)</th><th>Action</th></tr></thead>
              <tbody>
                {dfData.length ? dfData.slice(0,50).map(r => (
                  <tr key={r.month}>
                    <td>{r.month}</td><td>{r.amount}</td>
                    <td><button className="border-none bg-red text-white rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all hover:bg-red-600" onClick={() => { if(confirm('Delete?')) deleteDFEntry(r.month); }}>✕</button></td>
                  </tr>
                )) : <tr><td colSpan={3} className="text-center text-text-dim p-5 text-[10px]">No DF records yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
