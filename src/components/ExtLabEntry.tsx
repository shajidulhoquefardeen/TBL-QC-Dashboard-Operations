import { useState } from 'react';
import { useAppContext } from '../store';

export function ExtLabEntry() {
  const { extLabData, saveExtLabEntry, deleteExtLabEntry } = useAppContext();
  
  const [elId, setElId] = useState('');
  const [elLabel, setElLabel] = useState('');
  const [elExpiry, setElExpiry] = useState('');

  const isExpired = elExpiry ? new Date() > new Date(elExpiry) : false;
  const calculatedStatus = isExpired ? 'expired' : 'valid';

  const handleSaveExtLab = () => {
    if(!elLabel || !elExpiry) return alert('Label and Expiry are required');
    const id = elId || Date.now().toString();
    saveExtLabEntry({ id, label: elLabel, expiry: elExpiry, status: calculatedStatus, updatedAt: new Date().toISOString() });
    setElId(''); setElLabel(''); setElExpiry('');
  };

  return (
    <div className="p-[18px_22px]">
      <div className="bg-navy-card border border-border rounded-lg p-3.5 max-w-2xl mx-auto">
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-accent mb-3.5 pb-2 border-b border-border">🔬 External Lab Test Data Entry</div>
        <div className="bg-accent/5 border border-accent/20 rounded-md p-[10px_12px] text-[10px] text-text-muted mb-3.5">Manage external lab test certifications and their expiry dates.</div>
        
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium">Label *</label><input type="text" className="finp" placeholder="e.g. BCSIR (Water)" value={elLabel} onChange={e => setElLabel(e.target.value)} /></div>
          <div className="flex flex-col gap-1"><label className="text-[9px] text-text-muted font-medium">Expiry Date *</label><input type="date" className="finp" value={elExpiry} onChange={e => setElExpiry(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-medium">Status</label>
            <div className={`finp flex items-center ${calculatedStatus === 'valid' ? 'text-green' : 'text-red'}`}>
              {calculatedStatus.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2.5 justify-end">
          <button className="border border-border bg-transparent text-text-muted rounded px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all hover:border-accent hover:text-accent" onClick={() => {setElId(''); setElLabel(''); setElExpiry('');}}>Clear</button>
          <button className="border-none bg-accent text-white rounded px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all hover:bg-accent/80" onClick={handleSaveExtLab}>💾 Save Lab Test</button>
        </div>

        <div className="mt-4 pt-3.5 border-t border-border">
          <div className="text-[10px] text-text-muted font-semibold mb-2 uppercase tracking-[1px]">Lab Test Records</div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="dt">
              <thead><tr><th>Label</th><th>Expiry</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {extLabData.length ? extLabData.map(r => {
                  const isExpired = r.expiry ? new Date() > new Date(r.expiry) : false;
                  const status = isExpired ? 'expired' : 'valid';
                  return (
                    <tr key={r.id}>
                      <td>{r.label}</td><td>{r.expiry}</td>
                      <td className={status === 'valid' ? 'text-green' : 'text-red'}>{status.toUpperCase()}</td>
                      <td>
                        <button className="border-none bg-accent text-white rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all hover:bg-accent/80 mr-1" onClick={() => { setElId(r.id); setElLabel(r.label); setElExpiry(r.expiry); }}>✎</button>
                        <button className="border-none bg-red text-white rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all hover:bg-red/80" onClick={() => { if(confirm('Delete?')) deleteExtLabEntry(r.id); }}>✕</button>
                      </td>
                    </tr>
                  );
                }) : <tr><td colSpan={4} className="text-center text-text-dim p-5 text-[10px]">No lab test records yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
