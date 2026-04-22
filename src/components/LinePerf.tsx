import { useState, useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAppContext } from '../store';
import { calcYield, avgYield, yieldColor, getStatus } from '../utils';
import { LINES, FLAVOUR_COLOR } from '../constants';

Chart.register(...registerables);

export function LinePerf() {
  const { runs, customSettings, theme } = useAppContext();
  const [filter, setFilter] = useState({
    from: (() => { const d=new Date(); d.setDate(d.getDate()-30); return d.toISOString().slice(0,10); })(),
    to: new Date().toISOString().slice(0,10)
  });
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  const allLines = Array.from(new Set([...LINES, ...(customSettings.lines || [])]));
  const trendChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);

  const filteredRuns = runs.filter(r => {
    if(filter.from && r.date < filter.from) return false;
    if(filter.to && r.date > filter.to) return false;
    return true;
  });

  const selRuns = selectedLine ? filteredRuns.filter(r => r.line === selectedLine && calcYield(r).yieldPct > 0).sort((a,b) => a.date.localeCompare(b.date)) : [];

  useEffect(() => {
    let trendChart: Chart | null = null;
    let pieChart: Chart | null = null;

    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
    const textColor = theme === 'dark' ? '#64748b' : '#94a3b8';

    if (selectedLine && selRuns.length > 0) {
      if (trendChartRef.current) {
        const last30 = selRuns.slice(-30);
        trendChart = new Chart(trendChartRef.current, {
          type: 'line',
          data: {
            labels: last30.map(r => r.date?.slice(5) || ''),
            datasets: [
              { label: selectedLine, data: last30.map(r => calcYield(r).yieldPct.toFixed(2)), borderColor: '#06b6d4', backgroundColor: '#06b6d418', tension: 0.4, fill: true, pointRadius: 2, borderWidth: 2 },
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

      if (pieChartRef.current) {
        const flavMap: Record<string, number> = {};
        selRuns.forEach(r => { const f = r.flavour || '?'; flavMap[f] = (flavMap[f] || 0) + 1; });
        const fKeys = Object.keys(flavMap);
        pieChart = new Chart(pieChartRef.current, {
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
      if (pieChart) pieChart.destroy();
    };
  }, [selectedLine, selRuns, theme]);

  const avg = avgYield(selRuns);
  const flavMap: Record<string, number> = {};
  selRuns.forEach(r => { const f = r.flavour || '?'; flavMap[f] = (flavMap[f] || 0) + 1; });
  const topFlav = Object.entries(flavMap).sort((a,b) => b[1] - a[1])[0];
  const microPen = selRuns.filter(r => ['micro_due','micro_pen'].includes(getStatus(r).code)).length;

  return (
    <div className="p-[18px_22px]">
      <div className="flex gap-[9px] flex-wrap items-end mb-4">
        <div className="flex flex-col gap-[3px]"><div className="text-[8px] text-text-muted">From Date</div><input type="date" className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none focus:border-accent" value={filter.from} onChange={e => setFilter({...filter, from: e.target.value})} /></div>
        <div className="flex flex-col gap-[3px]"><div className="text-[8px] text-text-muted">To Date</div><input type="date" className="bg-navy-card border border-border rounded px-2 py-1 text-text text-[10px] font-sans outline-none focus:border-accent" value={filter.to} onChange={e => setFilter({...filter, to: e.target.value})} /></div>
        <button className="border-none bg-pepsi text-white rounded px-[9px] py-[3px] text-[10px] font-semibold cursor-pointer transition-all hover:bg-pepsi/80" onClick={() => {}}>Apply Filter</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3.5">
        {allLines.map(ln => {
          const lr = filteredRuns.filter(r => r.line === ln && calcYield(r).yieldPct > 0);
          const avgC = avgYield(lr);
          const col = avgC > 0 ? yieldColor(avgC) : 'text-text-dim';
          return (
            <div key={ln} className={`bg-navy-card border-2 rounded-lg p-3 cursor-pointer transition-all hover:border-accent ${selectedLine === ln ? 'border-accent' : 'border-border'}`} onClick={() => setSelectedLine(ln)}>
              <div className="font-condensed font-black text-[28px] text-text-dim leading-none">L{ln.replace('Line ','')}</div>
              <div className="text-[9px] text-text-muted mt-0.5">{ln} – {lr.length} runs</div>
              <div className={`font-condensed font-extrabold text-[22px] mt-1 ${col}`}>{avgC > 0 ? avgC.toFixed(2) + '%' : '—'}</div>
            </div>
          );
        })}
      </div>

      {selectedLine && (
        <div className="bg-navy-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border">
            <div>
              <div className="font-condensed font-extrabold text-2xl">{selectedLine}</div>
              <div className="text-[10px] text-text-muted">{(filter.from && filter.to) ? `${filter.from} to ${filter.to}` : 'All time'}</div>
            </div>
            <button className="border border-border bg-transparent text-text-muted rounded px-[9px] py-[3px] text-[10px] font-semibold cursor-pointer transition-all hover:border-accent hover:text-accent" onClick={() => setSelectedLine(null)}>✕ Close</button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mb-3">
            <div className="bg-navy border border-border rounded-md p-2.5 text-center"><div className="font-condensed font-extrabold text-lg text-green">{avg > 0 ? avg.toFixed(2) + '%' : '—'}</div><div className="text-[8px] text-text-dim mt-0.5">Avg Yield %</div></div>
            <div className="bg-navy border border-border rounded-md p-2.5 text-center"><div className="font-condensed font-extrabold text-lg">{selRuns.length}</div><div className="text-[8px] text-text-dim mt-0.5">Total Runs</div></div>
            <div className="bg-navy border border-border rounded-md p-2.5 text-center"><div className="font-condensed font-extrabold text-lg">{topFlav ? topFlav[0] : '—'}</div><div className="text-[8px] text-text-dim mt-0.5">Top Flavour</div></div>
            <div className="bg-navy border border-border rounded-md p-2.5 text-center"><div className="font-condensed font-extrabold text-lg text-amber">{microPen}</div><div className="text-[8px] text-text-dim mt-0.5">Micro Pending</div></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-navy border border-border rounded-lg p-3.5"><div className="font-condensed font-semibold text-[10px] tracking-[1.5px] uppercase text-text-muted mb-2.5 pb-1.5 border-b border-border">Yield Trend (last 30 batches)</div><div className="relative h-[200px]"><canvas ref={trendChartRef}></canvas></div></div>
            <div className="bg-navy border border-border rounded-lg p-3.5"><div className="font-condensed font-semibold text-[10px] tracking-[1.5px] uppercase text-text-muted mb-2.5 pb-1.5 border-b border-border">Yield by Flavour</div><div className="relative h-[200px]"><canvas ref={pieChartRef}></canvas></div></div>
          </div>

          <div className="bg-navy border border-border rounded-lg p-3.5">
            <div className="font-condensed font-semibold text-[10px] tracking-[1.5px] uppercase text-text-muted mb-2.5 pb-1.5 border-b border-border">Filtered Line Records</div>
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="dt w-full text-left">
                <thead>
                  <tr className="text-[9px] text-text-dim uppercase tracking-wider border-b border-border/50">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Shift</th>
                    <th className="py-2 px-3">Batch</th>
                    <th className="py-2 px-3">Flavour</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Yield %</th>
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {[...selRuns].reverse().map((r, idx) => {
                    const y = calcYield(r);
                    const col = yieldColor(y.yieldPct);
                    return (
                      <tr key={r.id || idx} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3">{r.date}</td>
                        <td className="py-2 px-3">{r.shift}</td>
                        <td className="py-2 px-3 font-mono text-[9px]">{r.batchNo}</td>
                        <td className="py-2 px-3">{r.flavour}</td>
                        <td className="py-2 px-3">{r.sku}ml</td>
                        <td className={`py-2 px-3 text-right font-bold ${col}`}>{y.yieldPct.toFixed(2)}%</td>
                      </tr>
                    );
                  })}
                  {selRuns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-text-dim italic">No records found for this line in the selected period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
