import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAppContext } from '../store';
import { calcYield, avgYield, yrRuns, todayRuns, getStatus, yieldColor } from '../utils';
import { CHEMISTS, MONTHS, FLAVOUR_COLOR } from '../constants';

Chart.register(...registerables);

export function YieldDashboard() {
  const { runs, customSettings, theme } = useAppContext();
  const yr = yrRuns(runs);
  const td = todayRuns(runs);
  const now = new Date();

  const allChemists = customSettings.chemists || [];

  const ftdChartRef = useRef<HTMLCanvasElement>(null);
  const monthlyChartRef = useRef<HTMLCanvasElement>(null);
  const pepsiChartRef = useRef<HTMLCanvasElement>(null);
  const upChartRef = useRef<HTMLCanvasElement>(null);
  const mirindaChartRef = useRef<HTMLCanvasElement>(null);
  const dewChartRef = useRef<HTMLCanvasElement>(null);
  const l1ChartRef = useRef<HTMLCanvasElement>(null);
  const l2ChartRef = useRef<HTMLCanvasElement>(null);
  const l3ChartRef = useRef<HTMLCanvasElement>(null);
  const l4ChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const charts: Chart[] = [];

    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
    const textColor = theme === 'dark' ? '#64748b' : '#94a3b8';

    const createChart = (ref: React.RefObject<HTMLCanvasElement | null>, type: any, data: any, options: any) => {
      if (ref.current) {
        charts.push(new Chart(ref.current, { type, data, options }));
      }
    };

    // FTD Chart
    const tdValid = td.filter(r => calcYield(r).yieldPct > 0);
    const ftdLabels = tdValid.length ? tdValid.map(r => `${r.date?.slice(5)||''} ${r.flavour?.split(' ')[0]||''} B${r.batchNo?.slice(-3)||''}`) : ['18/03 7UP EF129'];
    const ftdVals   = tdValid.length ? tdValid.map(r => calcYield(r).yieldPct) : [99.98];
    createChart(ftdChartRef, 'bar', {
      labels: ftdLabels,
      datasets: [{ label: 'FTD Yield %', data: ftdVals, backgroundColor: '#3b82f699', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 2 }]
    }, {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { min: 95, max: 106, ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } }, y: { ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } } }
    });

    // Monthly Chart
    const last3 = [2,1,0].map(i => {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const mr = yr.filter(r => { const rd=new Date(r.date); return rd.getMonth()===d.getMonth()&&rd.getFullYear()===d.getFullYear(); });
      return {lbl: MONTHS[d.getMonth()]+' '+d.getFullYear().toString().slice(2), val: avgYield(mr)};
    });
    createChart(monthlyChartRef, 'bar', {
      labels: last3.map(m=>m.lbl),
      datasets: [{ label: 'Monthly Avg', data: last3.map(m=>m.val), backgroundColor: '#3b82f699', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 2 }]
    }, {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { min: 95, max: 106, ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } }, x: { ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } } }
    });

    // Product Charts
    const prodChart = (ref: any, flavour: string) => {
      const pr = yr.filter(r => String(r.flavour||'').toLowerCase()===String(flavour||'').toLowerCase());
      const vals = last3.map((m,i) => {
        const mr = pr.filter(r => { const rd=new Date(r.date); const md=new Date(now.getFullYear(),now.getMonth()-( 2-i),1); return rd.getMonth()===md.getMonth(); });
        return avgYield(mr);
      });
      const col = FLAVOUR_COLOR[flavour] || '#3b82f6';
      createChart(ref, 'bar', {
        labels: last3.map(m=>m.lbl),
        datasets: [{ label: flavour, data: vals, backgroundColor: col+'99', borderColor: col, borderWidth: 1, borderRadius: 2 }]
      }, {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 94, max: 107, ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } }, x: { ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } } }
      });
    };
    prodChart(pepsiChartRef, 'Pepsi');
    prodChart(upChartRef, '7UP EF');
    prodChart(mirindaChartRef, 'Mirinda');
    prodChart(dewChartRef, 'Dew');

    // Line Charts
    const lineLastDays = (ref: any, line: string) => {
      const last7 = Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(d.getDate()-(6-i));return d.toISOString().slice(0,10);});
      const vals = last7.map((date,i) => {
        const dr = runs.filter(r=>r.date===date&&r.line===line);
        return avgYield(dr);
      });
      const col = 
        line === 'Line 1' ? '#10b981' : 
        line === 'Line 2' ? '#f59e0b' : 
        line === 'Line 3' ? '#06b6d4' : 
        '#8b5cf6';
      createChart(ref, 'bar', {
        labels: last7.map(d=>d.slice(5)),
        datasets: [{ label: line, data: vals, backgroundColor: col+'99', borderColor: col, borderWidth: 1, borderRadius: 2 }]
      }, {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 94, max: 107, ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } }, x: { ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } } }
      });
    };
    lineLastDays(l1ChartRef, 'Line 1');
    lineLastDays(l2ChartRef, 'Line 2');
    lineLastDays(l3ChartRef, 'Line 3');
    lineLastDays(l4ChartRef, 'Line 4');

    return () => charts.forEach(c => c.destroy());
  }, [runs, theme]);

  const chemYield = (name: string) => {
    const cr = yr.filter(r => r.chemistStartup===name||r.chemistEndup===name);
    return avgYield(cr);
  };

  const renderChemCell = (c: string) => {
    const y = chemYield(c);
    const yStr = y > 0 ? y.toFixed(1) + '%' : '—';
    const col = y > 0 ? yieldColor(y) : 'text-text-dim';
    return (
      <div key={c} className="bg-navy-card border border-border rounded-xl p-2 text-center h-full flex flex-col justify-center shadow-md">
        <div className={`${y > 0 ? col : 'text-text-dim'} font-condensed font-black text-xl leading-none`}>{yStr}</div>
        <div className="text-text-muted text-[8px] mt-1 whitespace-nowrap overflow-hidden text-ellipsis">Mr. {c}</div>
      </div>
    );
  };

  const pending = runs.filter(r=>['micro_due','started'].includes(getStatus(r).code)).slice(0,8);

  return (
    <div id="yield-dashboard" className="p-4 max-w-fit bg-navy min-h-screen mx-auto text-text">
      {/* Header */}
      <div className="flex justify-between items-end mb-4 pb-3 border-b border-border/30">
        <div>
          <h1 className="text-text font-condensed font-black text-xl tracking-tight uppercase">Yield Dashboard</h1>
          <div className="flex items-center gap-4 mt-0.5">
            <div className="text-text-muted text-[10px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green"></span>
              Chittagong Plant · <strong className="text-text">{now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
        </div>
        <div className="bg-pepsi px-3 py-1.5 rounded-md shadow-lg flex flex-col items-end">
          <div className="text-white/70 text-[8px] uppercase font-bold tracking-widest">Reporting Period</div>
          <div className="text-white text-sm font-condensed font-black leading-none mt-0.5">{MONTHS[now.getMonth()]} {now.getFullYear()}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[260px_260px_1fr] gap-3">
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-2 uppercase">FTD Conc. Yield</div>
            <div className="relative h-[140px]"><canvas ref={ftdChartRef}></canvas></div>
          </div>
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-2 uppercase">Month Wise Yield</div>
            <div className="relative h-[140px]"><canvas ref={monthlyChartRef}></canvas></div>
          </div>
          <div className="flex flex-col h-full gap-2">
            <div className="grid grid-cols-5 gap-2 flex-1 h-full">
              {allChemists.slice(0, 5).map(renderChemCell)}
            </div>
            <div className="grid grid-cols-5 gap-2 flex-1 h-full">
              {allChemists.slice(5, 10).map(renderChemCell)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-1 uppercase">Pepsi Yield</div>
            <div className="relative h-[100px]"><canvas ref={pepsiChartRef}></canvas></div>
          </div>
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-1 uppercase">7UP EF Yield</div>
            <div className="relative h-[100px]"><canvas ref={upChartRef}></canvas></div>
          </div>
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-1 uppercase">Mirinda Yield</div>
            <div className="relative h-[100px]"><canvas ref={mirindaChartRef}></canvas></div>
          </div>
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-1 uppercase">Mountain Dew Yield</div>
            <div className="relative h-[100px]"><canvas ref={dewChartRef}></canvas></div>
          </div>
        </div>

        <div className="grid grid-cols-[260px_1fr_1fr] gap-3">
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl overflow-y-auto row-span-2 flex flex-col">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-2 uppercase">⚠ Needs Attention</div>
            <div className="flex-1 overflow-y-auto">
              {pending.length ? pending.map(r => {
                const st = getStatus(r);
                return (
                  <div key={r.id} className="flex justify-between items-center py-1 text-[9px] border-b border-border/40">
                    <span className="text-text">L{r.line?.slice(-1) || '?'} · {r.flavour?.split(' ')[0] || '?'} · B{r.batchNo?.slice(-5) || '?'}</span>
                    <span style={st.style} className="inline-flex items-center gap-[3px] text-[7px] font-bold tracking-[0.5px] px-1.5 py-0.5 rounded-[3px]">{st.lbl}</span>
                  </div>
                );
              }) : <div className="text-green text-[10px] mt-2">✔ All up to date</div>}
            </div>
          </div>
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-1 uppercase">Line 4 Yield</div>
            <div className="relative h-[100px]"><canvas ref={l4ChartRef}></canvas></div>
          </div>
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-1 uppercase">Line 3 Yield</div>
            <div className="relative h-[100px]"><canvas ref={l3ChartRef}></canvas></div>
          </div>
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-1 uppercase">Line 2 Yield</div>
            <div className="relative h-[100px]"><canvas ref={l2ChartRef}></canvas></div>
          </div>
          <div className="bg-navy-card border border-border rounded-xl p-3 shadow-xl">
            <div className="text-text-muted font-condensed font-bold text-[10px] tracking-[2px] mb-1 uppercase">Line 1 Yield</div>
            <div className="relative h-[100px]"><canvas ref={l1ChartRef}></canvas></div>
          </div>
        </div>
      </div>
    </div>
  );
}
