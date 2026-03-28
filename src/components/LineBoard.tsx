import { useAppContext } from '../store';
import { calcYield, getStatus, yieldColor } from '../utils';
import { LINES } from '../constants';
import { Lock, Unlock } from 'lucide-react';

export function LineBoard() {
  const { runs, openModal, customSettings, role, toggleRunLock } = useAppContext();

  const activeRuns = runs.filter(r => ['started','micro_due','micro_pen'].includes(getStatus(r).code)).sort((a,b) => b.date.localeCompare(a.date));
  const allLines = customSettings.lines || [];

  return (
    <div className="p-[18px_22px]">
      <div className="flex justify-between items-center mb-3.5">
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-text-muted flex items-center gap-1.5 before:content-[''] before:w-0.5 before:h-[13px] before:bg-accent before:rounded-sm">{allLines.length}-Line Operations Board</div>
        <button className="border-none bg-pepsi text-white rounded px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all hover:bg-blue-600" onClick={() => openModal()}>+ Start New Run</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {allLines.map(ln => {
          const lr = runs.filter(r => r.line === ln).sort((a,b) => b.date.localeCompare(a.date));
          const latest = lr[0];
          const st = latest ? getStatus(latest) : {code:'idle',lbl:'Idle',cls:'bg-navy-light/15 text-text-dim'};
          const yld = latest ? calcYield(latest) : null;
          const yP = yld && yld.yieldPct > 0 ? yld.yieldPct.toFixed(2) + '%' : '—';
          const yCC = yld && yld.yieldPct > 0 ? yieldColor(yld.yieldPct) : '';
          const lnum = ln.replace('Line ','');

          return (
            <div key={ln} className={`bg-navy-card border-2 rounded-[9px] p-3.5 transition-colors ${st.code === 'started' ? 'border-teal' : st.code === 'micro_due' ? 'border-amber' : st.code === 'closed' ? 'border-green' : 'border-border'}`}>
              <div className="font-condensed font-black text-[28px] text-text-dim leading-none">L{lnum}</div>
              <span className={`inline-block px-1.5 py-0.5 rounded-[3px] text-[8px] font-bold tracking-[.8px] uppercase my-1 ${st.cls}`}>{st.lbl}</span>
              {latest ? (
                <div className="text-[10px] text-text-muted leading-[1.6] my-1">
                  <strong className="text-text">{latest.flavour || '—'}</strong> · {latest.sku || '—'}ml<br/>
                  <span className="text-[9px]">Batch: {latest.batchNo || '—'}</span><br/>
                  <span className="text-[9px]">Start: {latest.chemistStartup || '—'} &nbsp;|&nbsp; End: {latest.chemistEndup || '—'}</span>
                </div>
              ) : (
                <div className="text-[9px] text-text-dim my-1">No recent run</div>
              )}
              <div className={`font-condensed font-extrabold text-[20px] my-1 ${yCC}`}>{yP}</div>
              <div className="flex gap-1.5 flex-wrap mt-2">
                <button className="border-none bg-pepsi text-white rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all hover:bg-blue-600" onClick={() => openModal(null, ln)}>+ Start</button>
                {latest && st.code !== 'closed' && (
                  <div className="flex gap-1">
                    {role === 'superadmin' && (
                      <button 
                        onClick={() => toggleRunLock(latest.id)}
                        className={`p-1 rounded transition-colors ${latest.isLocked ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                        title={latest.isLocked ? "Unlock" : "Lock"}
                      >
                        {latest.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                    )}
                    <button 
                      className={`border-none rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all ${latest.isLocked && role !== 'superadmin' ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-amber text-navy hover:bg-amber-400'}`} 
                      onClick={() => openModal(latest.id)}
                      disabled={latest.isLocked && role !== 'superadmin'}
                    >
                      {latest.isLocked && role !== 'superadmin' ? 'Locked' : 'Edit'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-text-muted flex items-center gap-1.5 mb-2.5 before:content-[''] before:w-0.5 before:h-[13px] before:bg-accent before:rounded-sm">Active &amp; In-Progress Runs</div>
      <div className="bg-navy-card border border-border rounded-lg p-3.5">
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="dt">
            <thead>
              <tr>
                <th>Batch</th><th>Date</th><th>Line</th><th>Shift</th><th>Start Chemist</th><th>End Chemist</th><th>Flavour</th><th>SKU</th><th>Status</th><th>Yield%</th><th>Syrup</th><th>Prod</th><th>Micro</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeRuns.length ? activeRuns.map(r => {
                const st = getStatus(r);
                const yld = calcYield(r);
                const yP = yld.yieldPct > 0 ? yld.yieldPct.toFixed(2) + '%' : '—';
                const hasSyr = (r.lineSyrupVol || 0) > 0;
                const hasFG = (r.lineFG || 0) > 0;
                const hasMicro = r.tpc !== undefined && r.tpc !== null && r.tpc !== '';

                return (
                  <tr key={r.id} className={st.code === 'micro_due' ? 'bg-amber-500/5' : 'bg-cyan-500/5'}>
                    <td className="font-mono text-[9px]">{r.batchNo || '—'}</td>
                    <td className="d">{r.date || '—'}</td>
                    <td><strong>{r.line?.replace('Line ','') || '?'}</strong></td>
                    <td className="d">{r.shift || '—'}</td>
                    <td>{r.chemistStartup || '—'}</td>
                    <td>{r.chemistEndup || '—'}</td>
                    <td>{r.flavour || '—'}</td>
                    <td className="d">{r.sku || '—'}ml</td>
                    <td><span className={`inline-flex items-center gap-[3px] text-[8px] font-bold tracking-[.5px] px-1.5 py-0.5 rounded-[3px] ${st.cls}`}>{st.lbl}</span></td>
                    <td className={`${yieldColor(yld.yieldPct)} font-condensed font-bold text-[13px]`}>{yP}</td>
                    <td><div className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[8px] font-bold shrink-0 ${hasSyr ? 'bg-green-500/20 text-green' : 'bg-red-500/20 text-red'}`}>{hasSyr ? '✔' : '✖'}</div></td>
                    <td><div className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[8px] font-bold shrink-0 ${hasFG ? 'bg-green-500/20 text-green' : 'bg-red-500/20 text-red'}`}>{hasFG ? '✔' : '✖'}</div></td>
                    <td><div className={`w-3.5 h-3.5 rounded-[3px] flex items-center justify-center text-[8px] font-bold shrink-0 ${hasMicro ? 'bg-green-500/20 text-green' : st.code === 'micro_due' ? 'bg-red-500/20 text-red' : 'bg-amber-500/15 text-amber'}`}>{hasMicro ? '✔' : st.code === 'micro_due' ? '✖' : '⏳'}</div></td>
                    <td className="flex gap-1">
                      {role === 'superadmin' && (
                        <button 
                          onClick={() => toggleRunLock(r.id)}
                          className={`p-1 rounded transition-colors ${r.isLocked ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
                          title={r.isLocked ? "Unlock" : "Lock"}
                        >
                          {r.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                      )}
                      <button 
                        className={`border-none rounded px-2 py-1 text-[10px] font-semibold cursor-pointer transition-all ${r.isLocked && role !== 'superadmin' ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-pepsi text-white hover:bg-blue-600'}`} 
                        onClick={() => openModal(r.id)}
                        disabled={r.isLocked && role !== 'superadmin'}
                      >
                        {r.isLocked && role !== 'superadmin' ? 'Locked' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={14}><div className="text-center p-9 text-text-dim"><div className="text-[32px] mb-2">✅</div><p>No active runs</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
