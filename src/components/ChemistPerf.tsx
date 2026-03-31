import { useState, useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAppContext } from '../store';
import { calcYield, avgYield, yieldColor } from '../utils';
import { FLAVOUR_COLOR, CHEMISTS } from '../constants';

Chart.register(...registerables);

export function ChemistPerf() {
  const { runs, customSettings, theme } = useAppContext();
  const [filter, setFilter] = useState({
    from: (() => { const d=new Date(); d.setDate(d.getDate()-30); return d.toISOString().slice(0,10); })(),
    to: new Date().toISOString().slice(0,10),
    role: 'both'
  });
  const [selectedChem, setSelectedChem] = useState<string | null>(null);

  const allChemists = [...CHEMISTS, ...(customSettings.chemists || [])];
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const flavourChartRef = useRef<HTMLCanvasElement>(null);

  const filteredRuns = runs.filter(r => {
    if(filter.from && r.date < filter.from) return false;
    if(filter.to && r.date > filter.to) return false;
    return true;
  });

  const getChemRuns = (c: string) => {
    if(filter.role === 'startup') return filteredRuns.filter(r => r.chemistStartup === c);
    if(filter.role === 'endup') return filteredRuns.filter(r => r.chemistEndup === c);
    return filteredRuns.filter(r => r.chemistStartup === c || r.chemistEndup === c);
  };

  const selRuns = selectedChem ? getChemRuns(selectedChem).filter(r => calcYield(r).yieldPct > 0).sort((a,b) => a.date.localeCompare(b.date)) : [];

  useEffect(() => {
    let trendChart: Chart | null = null;
    let flavourChart: Chart | null = null;

    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
    const textColor = theme === 'dark' ? '#64748b' : '#94a3b8';

    if (selectedChem && selRuns.length > 0) {
      if (trendChartRef.current) {
        const last30 = selRuns.slice(-30);
        trendChart = new Chart(trendChartRef.current, {
          type: 'line',
          data: {
            labels: last30.map(r => r.date?.slice(5) || ''),
            datasets: [
              { label: 'Yield %', data: last30.map(r => calcYield(r).yieldPct.toFixed(2)), borderColor: '#06b6d4', backgroundColor: '#06b6d418', tension: 0.4, fill: true, pointRadius: 2, borderWidth: 2 },
              { label: '100%', data: Array(last30.length).fill(100), borderColor: theme === 'dark' ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)', borderDash: [4, 3], borderWidth: 1, pointRadius: 0, fill: false }
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } },
              y: { min: 94, max: 108, ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } }
            }
          }
        });
      }

      if (flavourChartRef.current) {
        const flavMap: Record<string, number> = {};
        selRuns.forEach(r => { const f = r.flavour || 'Unknown'; flavMap[f] = (flavMap[f] || 0) + 1; });
        const fKeys = Object.keys(flavMap);
        flavourChart = new Chart(flavourChartRef.current, {
          type: 'doughnut',
          data: {
            labels: fKeys,
            datasets: [{ data: fKeys.map(k => flavMap[k]), backgroundColor: fKeys.map(k => (FLAVOUR_COLOR[k] || '#06b6d4') + 'cc'), borderWidth: 1, borderColor: theme === 'dark' ? '#1e293b' : '#ffffff' }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: textColor, font: { size: 8 }, boxWidth: 9, padding: 6 } } }
          }
        });
      }
    }

    return () => {
      if (trendChart) trendChart.destroy();
      if (flavourChart) flavourChart.destroy();
    };
  }, [selectedChem, selRuns, theme]);

  const yields = selRuns.map(r => calcYield(r).yieldPct);
  const avg = avgYield(selRuns);
  const best = yields.length ? Math.max(...yields) : 0;
  const worst = yields.length ? Math.min(...yields) : 0;

  return (
    <div className="p-[18px_22px]">
      <div className="flex gap-[9px] flex-wrap items-end mb-4">
        <div className="flex flex-col gap-[3px]"><div className="text-[8px] text-text-muted">From Date</div><input type="date" className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none focus:border-accent" value={filter.from} onChange={e => setFilter({...filter, from: e.target.value})} /></div>
        <div className="flex flex-col gap-[3px]"><div className="text-[8px] text-text-muted">To Date</div><input type="date" className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none focus:border-accent" value={filter.to} onChange={e => setFilter({...filter, to: e.target.value})} /></div>
        <div className="flex flex-col gap-[3px]"><div className="text-[8px] text-text-muted">Role</div><select className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none focus:border-accent" value={filter.role} onChange={e => setFilter({...filter, role: e.target.value})}><option value="both">All Roles</option><option value="startup">Startup Chemist</option><option value="endup">Endup Chemist</option></select></div>
        <button className="border-none bg-pepsi text-white rounded px-[9px] py-[3px] text-[10px] font-semibold cursor-pointer transition-all hover:bg-pepsi/80" onClick={() => {}}>Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3.5">
        {allChemists.map(c => {
          const cr = getChemRuns(c);
          const avgC = avgYield(cr);
          const col = avgC > 0 ? yieldColor(avgC) : 'text-text-dim';
          return (
            <div key={c} className={`bg-navy-card border-2 rounded-lg p-3 text-center cursor-pointer transition-all hover:border-accent hover:bg-accent/5 ${selectedChem === c ? 'border-accent bg-accent/5' : 'border-border'}`} onClick={() => setSelectedChem(c)}>
              <div className={`font-condensed font-black text-2xl leading-none ${col}`}>{avgC > 0 ? avgC.toFixed(2) + '%' : '—'}</div>
              <div className="text-[9px] text-text-muted mt-[3px]">Mr. {c}</div>
              <div className="text-[8px] text-text-dim mt-[1px]">{cr.length} runs</div>
            </div>
          );
        })}
      </div>

      {selectedChem && (
        <div className="bg-navy-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border">
            <div>
              <div className="font-condensed font-extrabold text-2xl">Mr. {selectedChem}</div>
              <div className="text-[10px] text-text-muted">{(filter.from && filter.to) ? `${filter.from} to ${filter.to}` : (filter.from ? `From ${filter.from}` : (filter.to ? `To ${filter.to}` : 'All time'))}</div>
            </div>
            <button className="border border-border bg-transparent text-text-muted rounded px-[9px] py-[3px] text-[10px] font-semibold cursor-pointer transition-all hover:border-accent hover:text-accent" onClick={() => setSelectedChem(null)}>✕ Close</button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-3">
            <div className="bg-navy border border-border rounded-md p-2.5 text-center"><div className="font-condensed font-extrabold text-lg text-green">{avg > 0 ? avg.toFixed(2) + '%' : '—'}</div><div className="text-[8px] text-text-dim mt-0.5">Avg Yield %</div></div>
            <div className="bg-navy border border-border rounded-md p-2.5 text-center"><div className="font-condensed font-extrabold text-lg">{selRuns.length}</div><div className="text-[8px] text-text-dim mt-0.5">Total Runs</div></div>
            <div className="bg-navy border border-border rounded-md p-2.5 text-center"><div className="font-condensed font-extrabold text-lg text-teal">{best > 0 ? best.toFixed(2) + '%' : '—'}</div><div className="text-[8px] text-text-dim mt-0.5">Best Yield</div></div>
            <div className="bg-navy border border-border rounded-md p-2.5 text-center"><div className="font-condensed font-extrabold text-lg text-amber">{worst > 0 ? worst.toFixed(2) + '%' : '—'}</div><div className="text-[8px] text-text-dim mt-0.5">Lowest Yield</div></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-navy border border-border rounded-lg p-3.5"><div className="font-condensed font-semibold text-[10px] tracking-[1.5px] uppercase text-text-muted mb-2.5 pb-1.5 border-b border-border">Yield Trend</div><div className="relative h-[200px]"><canvas ref={trendChartRef}></canvas></div></div>
            <div className="bg-navy border border-border rounded-lg p-3.5"><div className="font-condensed font-semibold text-[10px] tracking-[1.5px] uppercase text-text-muted mb-2.5 pb-1.5 border-b border-border">Yield by Flavour</div><div className="relative h-[200px]"><canvas ref={flavourChartRef}></canvas></div></div>
          </div>

          <div className="bg-navy border border-border rounded-lg p-3.5">
            <div className="font-condensed font-semibold text-[10px] tracking-[1.5px] uppercase text-text-muted mb-2.5 pb-1.5 border-b border-border">Detailed Run List</div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="dt">
                <thead><tr><th>Date</th><th>Line</th><th>Batch</th><th>Flavour</th><th>SKU</th><th>Role</th><th>Total Syrup(L)</th><th>Total FG (cases)</th><th>Yield%</th></tr></thead>
                <tbody>
                  {selRuns.slice().reverse().slice(0, 50).map(r => {
                    const y = calcYield(r);
                    const roleStr = r.chemistStartup === selectedChem && r.chemistEndup === selectedChem ? 'Both' : r.chemistStartup === selectedChem ? 'Startup' : 'Endup';
                    return (
                      <tr key={r.id}>
                        <td>{r.date || '—'}</td><td>{r.line?.replace('Line ','') || '?'}</td>
                        <td className="font-mono text-[9px]">{r.batchNo || '—'}</td>
                        <td>{r.flavour || '—'}</td><td className="d">{r.sku || '—'}ml</td>
                        <td className="d text-[9px]">{roleStr}</td>
                        <td className="d">{y.totalSyr.toFixed(0)}</td><td className="d">{y.totalFG}</td>
                        <td className={`${yieldColor(y.yieldPct)} font-condensed font-bold`}>{y.yieldPct > 0 ? y.yieldPct.toFixed(2) + '%' : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
