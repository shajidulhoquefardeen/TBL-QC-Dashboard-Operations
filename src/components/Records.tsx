import { useState } from 'react';
import { useAppContext } from '../store';
import { calcYield, getStatus, yieldColor } from '../utils';
import { CHEMISTS, FLAVOURS, LINES } from '../constants';

export function Records() {
  const { runs, openModal, deleteRun, role, toggleRunLock } = useAppContext();
  const [filter, setFilter] = useState({
    from: '', to: '', line: '', chem: '', flav: '', st: ''
  });

  const filteredRuns = runs.filter(r => {
    if(filter.from && r.date < filter.from) return false;
    if(filter.to && r.date > filter.to) return false;
    if(filter.line && r.line !== filter.line) return false;
    if(filter.chem && r.chemistStartup !== filter.chem && r.chemistEndup !== filter.chem) return false;
    if(filter.flav && r.flavour !== filter.flav) return false;
    if(filter.st && getStatus(r).code !== filter.st) return false;
    return true;
  }).sort((a,b) => b.date.localeCompare(a.date));

  const resetFilter = () => setFilter({from: '', to: '', line: '', chem: '', flav: '', st: ''});

  return (
    <div className="p-[18px_22px]">
      <div className="flex gap-[9px] flex-wrap items-end mb-3">
        <div className="flex flex-col gap-[3px]">
          <div className="text-[8px] text-text-muted">From</div>
          <input 
            type="date" 
            className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none" 
            value={filter.from} 
            onChange={e => setFilter({...filter, from: e.target.value})} 
          />
        </div>
        <div className="flex flex-col gap-[3px]">
          <div className="text-[8px] text-text-muted">To</div>
          <input 
            type="date" 
            className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none" 
            value={filter.to} 
            onChange={e => setFilter({...filter, to: e.target.value})} 
          />
        </div>
        <div className="flex flex-col gap-[3px]">
          <div className="text-[8px] text-text-muted">Line</div>
          <select 
            className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none" 
            value={filter.line} 
            onChange={e => setFilter({...filter, line: e.target.value})}
          >
            <option value="">All</option>
            {LINES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-[3px]">
          <div className="text-[8px] text-text-muted">Chemist</div>
          <select 
            className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none" 
            value={filter.chem} 
            onChange={e => setFilter({...filter, chem: e.target.value})}
          >
            <option value="">All</option>
            {CHEMISTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-[3px]">
          <div className="text-[8px] text-text-muted">Flavour</div>
          <select 
            className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none" 
            value={filter.flav} 
            onChange={e => setFilter({...filter, flav: e.target.value})}
          >
            <option value="">All</option>
            {FLAVOURS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-[3px]">
          <div className="text-[8px] text-text-muted">Status</div>
          <select 
            className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none" 
            value={filter.st} 
            onChange={e => setFilter({...filter, st: e.target.value})}
          >
            <option value="">All</option>
            <option value="started">Running</option>
            <option value="micro_due">⚠ Micro Due</option>
            <option value="micro_pen">Micro Pending</option>
            <option value="closed">✓ Closed</option>
          </select>
        </div>
        <button 
          className="border-none bg-pepsi text-white rounded px-2 py-1 text-[10px] font-semibold cursor-pointer" 
          onClick={() => {}}
        >
          Filter
        </button>
        <button 
          className="border border-border bg-transparent text-text-muted rounded px-2 py-1 text-[10px] font-semibold cursor-pointer" 
          onClick={resetFilter}
        >
          Reset
        </button>
      </div>

      <div className="text-[8px] text-text-dim mb-1.5">
        Indicators → <span className="text-green">✔ Done</span> &nbsp;
        <span className="text-red">✖ Missing</span> &nbsp;
        <span className="text-amber">⏳ Pending</span>
      </div>

      <div className="bg-navy-card border border-border rounded-lg p-3.5">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="dt">
            <thead>
              <tr>
                <th>#</th><th>Date</th><th>Batch</th><th>Line</th><th>Shift</th><th>Start Chem</th><th>End Chem</th><th>Flavour</th><th>SKU</th><th>Status</th><th>Yield%</th><th>Syrup(L)</th><th>Total FG</th><th title="Syrup entered">🫙</th><th title="FG entered">📦</th><th title="Micro">🦠</th><th>Remarks</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.length ? filteredRuns.map((r, i) => {
                const st = getStatus(r);
                const yld = calcYield(r);
                const yP = yld.yieldPct > 0 ? yld.yieldPct.toFixed(2) + '%' : '—';
                const hasSyr = (r.lineSyrupVol || 0) > 0;
                const hasFG = (r.lineFG || 0) > 0;
                const hasMicro = r.tpc !== undefined && r.tpc !== null && r.tpc !== '';

                return (
                  <tr key={r.id} className={st.code === 'micro_due' ? 'bg-amber/5' : ''}>
                    <td className="d">{i+1}</td>
                    <td>{r.date || '—'}</td>
                    <td className="font-mono text-[9px]">{r.batchNo || '—'}</td>
                    <td><strong>{r.line?.replace('Line ','') || '?'}</strong></td>
                    <td className="d">{r.shift || '—'}</td>
                    <td>{r.chemistStartup || '—'}</td>
                    <td>{r.chemistEndup || '—'}</td>
                    <td>{r.flavour || '—'}</td>
                    <td className="d">{r.sku || '—'}ml</td>
                    <td>
                      <span className={`inline-flex items-center gap-[3px] text-[8px] font-bold tracking-[0.5px] px-1.5 py-0.5 rounded-[3px] ${st.cls}`}>
                        {st.lbl}
                      </span>
                    </td>
                    <td className={`${yieldColor(yld.yieldPct)} font-bold text-[13px]`}>{yP}</td>
                    <td className="d">{yld.totalSyr > 0 ? yld.totalSyr.toFixed(0) : r.lineSyrupVol || '—'}</td>
                    <td className="d">{yld.totalFG > 0 ? yld.totalFG : '—'}</td>
                    <td>
                      <div className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[8px] font-bold shrink-0 ${hasSyr ? 'bg-green/20 text-green' : 'bg-red/20 text-red'}`}>
                        {hasSyr ? '✔' : '✖'}
                      </div>
                    </td>
                    <td>
                      <div className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[8px] font-bold shrink-0 ${hasFG ? 'bg-green/20 text-green' : 'bg-red/20 text-red'}`}>
                        {hasFG ? '✔' : '✖'}
                      </div>
                    </td>
                    <td>
                      <div className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[8px] font-bold shrink-0 ${hasMicro ? 'bg-green/20 text-green' : st.code === 'micro_due' ? 'bg-red/20 text-red' : 'bg-amber/15 text-amber'}`}>
                        {hasMicro ? '✔' : st.code === 'micro_due' ? '✖' : '⏳'}
                      </div>
                    </td>
                    <td className="max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap text-[9px]" title={r.remarks || ''}>{r.remarks || '—'}</td>
                    <td className="flex gap-1">
                      {role === 'superadmin' && (
                        <button 
                          className={`border-none rounded px-2 py-1 text-[10px] font-semibold cursor-pointer text-white ${r.isLocked ? 'bg-amber' : 'bg-slate-600'}`}
                          onClick={() => toggleRunLock(r.id)}
                          title={r.isLocked ? 'Unlock' : 'Lock'}
                        >
                          {r.isLocked ? '🔓' : '🔒'}
                        </button>
                      )}
                      <button 
                        className={`border-none rounded px-2 py-1 text-[10px] font-semibold text-white ${r.isLocked && role !== 'superadmin' ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-pepsi cursor-pointer'}`} 
                        onClick={() => { if(!r.isLocked || role === 'superadmin') openModal(r.id); }}
                        disabled={r.isLocked && role !== 'superadmin'}
                      >
                        Edit
                      </button>
                      <button 
                        className={`border-none rounded px-2 py-1 text-[10px] font-semibold text-white ${r.isLocked && role !== 'superadmin' ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-red cursor-pointer'}`} 
                        onClick={() => { if((!r.isLocked || role === 'superadmin') && confirm('Delete this run?')) deleteRun(r.id); }}
                        disabled={r.isLocked && role !== 'superadmin'}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={26}><div className="text-center p-9 text-text-dim"><div className="text-[32px] mb-2">📋</div><p>No records. Add runs or load sample data.</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-[9px] text-text-dim mt-1.5 pt-1.5 border-t border-border">
        Showing {filteredRuns.length} / {runs.length} &nbsp;|&nbsp; Micro Due: {filteredRuns.filter(r => getStatus(r).code === 'micro_due').length} &nbsp;|&nbsp; Closed: {filteredRuns.filter(r => getStatus(r).code === 'closed').length}
      </div>
    </div>
  );
}
