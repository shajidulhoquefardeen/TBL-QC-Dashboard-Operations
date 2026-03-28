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
    <div style={{ padding: '18px 22px' }}>
      <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)' }}>From</div>
          <input 
            type="date" 
            style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '4px 8px', color: '#FFFFFF', fontSize: '10px', fontFamily: 'sans-serif', outline: 'none' }} 
            value={filter.from} 
            onChange={e => setFilter({...filter, from: e.target.value})} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)' }}>To</div>
          <input 
            type="date" 
            style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '4px 8px', color: '#FFFFFF', fontSize: '10px', fontFamily: 'sans-serif', outline: 'none' }} 
            value={filter.to} 
            onChange={e => setFilter({...filter, to: e.target.value})} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)' }}>Line</div>
          <select 
            style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '4px 8px', color: '#FFFFFF', fontSize: '10px', fontFamily: 'sans-serif', outline: 'none' }} 
            value={filter.line} 
            onChange={e => setFilter({...filter, line: e.target.value})}
          >
            <option value="">All</option>
            {LINES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)' }}>Chemist</div>
          <select 
            style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '4px 8px', color: '#FFFFFF', fontSize: '10px', fontFamily: 'sans-serif', outline: 'none' }} 
            value={filter.chem} 
            onChange={e => setFilter({...filter, chem: e.target.value})}
          >
            <option value="">All</option>
            {CHEMISTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)' }}>Flavour</div>
          <select 
            style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '4px 8px', color: '#FFFFFF', fontSize: '10px', fontFamily: 'sans-serif', outline: 'none' }} 
            value={filter.flav} 
            onChange={e => setFilter({...filter, flav: e.target.value})}
          >
            <option value="">All</option>
            {FLAVOURS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)' }}>Status</div>
          <select 
            style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '4px 8px', color: '#FFFFFF', fontSize: '10px', fontFamily: 'sans-serif', outline: 'none' }} 
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
          style={{ border: 'none', backgroundColor: '#004B93', color: '#FFFFFF', borderRadius: '4px', padding: '3px 9px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }} 
          onClick={() => {}}
        >
          Filter
        </button>
        <button 
          style={{ border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'transparent', color: 'rgba(255, 255, 255, 0.5)', borderRadius: '4px', padding: '3px 9px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }} 
          onClick={resetFilter}
        >
          Reset
        </button>
      </div>

      <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.3)', marginBottom: '6px' }}>
        Indicators → <span style={{ color: '#22C55E' }}>✔ Done</span> &nbsp;
        <span style={{ color: '#EF4444' }}>✖ Missing</span> &nbsp;
        <span style={{ color: '#F59E0B' }}>⏳ Pending</span>
      </div>

      <div style={{ backgroundColor: '#0F172A', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '14px' }}>
        <div style={{ overflowX: 'auto', maxHeight: '520px', overflowY: 'auto' }}>
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
                  <tr key={r.id} style={st.code === 'micro_due' ? { backgroundColor: 'rgba(245, 158, 11, 0.05)' } : {}}>
                    <td className="d">{i+1}</td>
                    <td>{r.date || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '9px' }}>{r.batchNo || '—'}</td>
                    <td><strong>{r.line?.replace('Line ','') || '?'}</strong></td>
                    <td className="d">{r.shift || '—'}</td>
                    <td>{r.chemistStartup || '—'}</td>
                    <td>{r.chemistEndup || '—'}</td>
                    <td>{r.flavour || '—'}</td>
                    <td className="d">{r.sku || '—'}ml</td>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '3px', 
                        fontSize: '8px', 
                        fontWeight: 'bold', 
                        letterSpacing: '0.5px', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        ...st.style
                      }}>
                        {st.lbl}
                      </span>
                    </td>
                    <td style={{ color: yieldColor(yld.yieldPct), fontFamily: 'inherit', fontWeight: 'bold', fontSize: '13px' }}>{yP}</td>
                    <td className="d">{yld.totalSyr > 0 ? yld.totalSyr.toFixed(0) : r.lineSyrupVol || '—'}</td>
                    <td className="d">{yld.totalFG > 0 ? yld.totalFG : '—'}</td>
                    <td>
                      <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '3px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '8px', 
                        fontWeight: 'bold', 
                        flexShrink: 0,
                        backgroundColor: hasSyr ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: hasSyr ? '#22C55E' : '#EF4444'
                      }}>
                        {hasSyr ? '✔' : '✖'}
                      </div>
                    </td>
                    <td>
                      <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '3px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '8px', 
                        fontWeight: 'bold', 
                        flexShrink: 0,
                        backgroundColor: hasFG ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: hasFG ? '#22C55E' : '#EF4444'
                      }}>
                        {hasFG ? '✔' : '✖'}
                      </div>
                    </td>
                    <td>
                      <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        borderRadius: '3px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '8px', 
                        fontWeight: 'bold', 
                        flexShrink: 0,
                        backgroundColor: hasMicro ? 'rgba(34, 197, 94, 0.2)' : st.code === 'micro_due' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                        color: hasMicro ? '#22C55E' : st.code === 'micro_due' ? '#EF4444' : '#F59E0B'
                      }}>
                        {hasMicro ? '✔' : st.code === 'micro_due' ? '✖' : '⏳'}
                      </div>
                    </td>
                    <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '9px' }} title={r.remarks || ''}>{r.remarks || '—'}</td>
                    <td style={{ display: 'flex', gap: '4px' }}>
                      {role === 'superadmin' && (
                        <button 
                          style={{ 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '4px 8px', 
                            fontSize: '10px', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            backgroundColor: r.isLocked ? '#D97706' : '#475569',
                            color: '#FFFFFF'
                          }}
                          onClick={() => toggleRunLock(r.id)}
                          title={r.isLocked ? 'Unlock' : 'Lock'}
                        >
                          {r.isLocked ? '🔓' : '🔒'}
                        </button>
                      )}
                      <button 
                        style={{ 
                          border: 'none', 
                          borderRadius: '4px', 
                          padding: '4px 8px', 
                          fontSize: '10px', 
                          fontWeight: 600,
                          backgroundColor: r.isLocked && role !== 'superadmin' ? '#4B5563' : '#004B93',
                          cursor: r.isLocked && role !== 'superadmin' ? 'not-allowed' : 'pointer',
                          opacity: r.isLocked && role !== 'superadmin' ? 0.5 : 1,
                          color: '#FFFFFF'
                        }} 
                        onClick={() => { if(!r.isLocked || role === 'superadmin') openModal(r.id); }}
                        disabled={r.isLocked && role !== 'superadmin'}
                      >
                        Edit
                      </button>
                      <button 
                        style={{ 
                          border: 'none', 
                          borderRadius: '4px', 
                          padding: '4px 8px', 
                          fontSize: '10px', 
                          fontWeight: 600,
                          backgroundColor: r.isLocked && role !== 'superadmin' ? '#4B5563' : '#EF4444',
                          cursor: r.isLocked && role !== 'superadmin' ? 'not-allowed' : 'pointer',
                          opacity: r.isLocked && role !== 'superadmin' ? 0.5 : 1,
                          color: '#FFFFFF'
                        }} 
                        onClick={() => { if((!r.isLocked || role === 'superadmin') && confirm('Delete this run?')) deleteRun(r.id); }}
                        disabled={r.isLocked && role !== 'superadmin'}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={26}><div style={{ textAlign: 'center', padding: '36px', color: 'rgba(255, 255, 255, 0.3)' }}><div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div><p>No records. Add runs or load sample data.</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        Showing {filteredRuns.length} / {runs.length} &nbsp;|&nbsp; Micro Due: {filteredRuns.filter(r => getStatus(r).code === 'micro_due').length} &nbsp;|&nbsp; Closed: {filteredRuns.filter(r => getStatus(r).code === 'closed').length}
      </div>
    </div>
  );
}
