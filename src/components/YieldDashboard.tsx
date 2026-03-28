import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAppContext } from '../store';
import { calcYield, avgYield, yrRuns, todayRuns, getStatus, yieldColor } from '../utils';
import { CHEMISTS, MONTHS, FLAVOUR_COLOR } from '../constants';

Chart.register(...registerables);

export function YieldDashboard() {
  const { runs, customSettings } = useAppContext();
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
      datasets: [{ label: 'FTD Yield %', data: ftdVals, backgroundColor: '#1565c099', borderColor: '#1565c0', borderWidth: 1, borderRadius: 2 }]
    }, {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { min: 95, max: 106, ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } }, y: { ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } } }
    });

    // Monthly Chart
    const last3 = [2,1,0].map(i => {
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      const mr = yr.filter(r => { const rd=new Date(r.date); return rd.getMonth()===d.getMonth()&&rd.getFullYear()===d.getFullYear(); });
      return {lbl: MONTHS[d.getMonth()]+' '+d.getFullYear().toString().slice(2), val: avgYield(mr)};
    });
    createChart(monthlyChartRef, 'bar', {
      labels: last3.map(m=>m.lbl),
      datasets: [{ label: 'Monthly Avg', data: last3.map(m=>m.val), backgroundColor: '#1565c099', borderColor: '#1565c0', borderWidth: 1, borderRadius: 2 }]
    }, {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { min: 95, max: 106, ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } }, x: { ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } } }
    });

    // Product Charts
    const prodChart = (ref: any, flavour: string) => {
      const pr = yr.filter(r => String(r.flavour||'').toLowerCase()===String(flavour||'').toLowerCase());
      const vals = last3.map((m,i) => {
        const mr = pr.filter(r => { const rd=new Date(r.date); const md=new Date(now.getFullYear(),now.getMonth()-( 2-i),1); return rd.getMonth()===md.getMonth(); });
        return avgYield(mr);
      });
      const col = FLAVOUR_COLOR[flavour] || '#1565c0';
      createChart(ref, 'bar', {
        labels: last3.map(m=>m.lbl),
        datasets: [{ label: flavour, data: vals, backgroundColor: col+'99', borderColor: col, borderWidth: 1, borderRadius: 2 }]
      }, {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 94, max: 107, ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } }, x: { ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } } }
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
        line === 'Line 1' ? '#4caf50' : 
        line === 'Line 2' ? '#ff9800' : 
        line === 'Line 3' ? '#00bcd4' : 
        '#7b1fa2';
      createChart(ref, 'bar', {
        labels: last7.map(d=>d.slice(5)),
        datasets: [{ label: line, data: vals, backgroundColor: col+'99', borderColor: col, borderWidth: 1, borderRadius: 2 }]
      }, {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 94, max: 107, ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } }, x: { ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } } }
      });
    };
    lineLastDays(l1ChartRef, 'Line 1');
    lineLastDays(l2ChartRef, 'Line 2');
    lineLastDays(l3ChartRef, 'Line 3');
    lineLastDays(l4ChartRef, 'Line 4');

    return () => charts.forEach(c => c.destroy());
  }, [runs]);

  const chemYield = (name: string) => {
    const cr = yr.filter(r => r.chemistStartup===name||r.chemistEndup===name);
    return avgYield(cr);
  };

  const renderChemCell = (c: string) => {
    const y = chemYield(c);
    const yStr = y > 0 ? y.toFixed(1) + '%' : '—';
    const col = y > 0 ? yieldColor(y) : '#3a5a8a';
    return (
      <div key={c} style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '8px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ color: col, fontFamily: 'Inter Condensed, sans-serif', fontWeight: 900, fontSize: '20px', lineHeight: 1 }}>{yStr}</div>
        <div style={{ color: '#6a8fc0', fontSize: '8px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mr. {c}</div>
      </div>
    );
  };

  const pending = runs.filter(r=>['micro_due','started'].includes(getStatus(r).code)).slice(0,8);

  return (
    <div id="yield-dashboard" style={{ padding: '16px', maxWidth: 'fit-content', backgroundColor: '#0a0e17', minHeight: '100vh', marginLeft: 'auto', marginRight: 'auto', color: '#ffffff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(26, 48, 96, 0.3)' }}>
        <div>
          <h1 style={{ color: '#dce8ff', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.025em', textTransform: 'uppercase' }}>Yield Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '2px' }}>
            <div style={{ color: '#6a8fc0', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: '#22c55e' }}></span>
              Chittagong Plant · <strong style={{ color: '#dce8ff' }}>{now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1565c0', paddingLeft: '12px', paddingRight: '12px', paddingTop: '6px', paddingBottom: '6px', borderRadius: '6px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '8px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>Reporting Period</div>
          <div style={{ color: '#ffffff', fontSize: '14px', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 900, lineHeight: 1, marginTop: '2px' }}>{MONTHS[now.getMonth()]} {now.getFullYear()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 260px 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>FTD Conc. Yield</div>
            <div style={{ position: 'relative', height: '140px' }}><canvas ref={ftdChartRef}></canvas></div>
          </div>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>Month Wise Yield</div>
            <div style={{ position: 'relative', height: '140px' }}><canvas ref={monthlyChartRef}></canvas></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px', flex: '1 1 0%', height: '100%' }}>
              {allChemists.slice(0, 5).map(renderChemCell)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px', flex: '1 1 0%', height: '100%' }}>
              {allChemists.slice(5, 10).map(renderChemCell)}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Pepsi Yield</div>
            <div style={{ position: 'relative', height: '100px' }}><canvas ref={pepsiChartRef}></canvas></div>
          </div>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>7UP EF Yield</div>
            <div style={{ position: 'relative', height: '100px' }}><canvas ref={upChartRef}></canvas></div>
          </div>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Mirinda Yield</div>
            <div style={{ position: 'relative', height: '100px' }}><canvas ref={mirindaChartRef}></canvas></div>
          </div>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Mountain Dew Yield</div>
            <div style={{ position: 'relative', height: '100px' }}><canvas ref={dewChartRef}></canvas></div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: '12px' }}>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflowY: 'auto', gridRow: 'span 2', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>⚠ Needs Attention</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {pending.length ? pending.map(r => {
                const st = getStatus(r);
                return (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', paddingBottom: '4px', fontSize: '9px', borderBottom: '1px solid rgba(26, 47, 90, 0.4)' }}>
                    <span style={{ color: '#dce8ff' }}>L{r.line?.slice(-1) || '?'} · {r.flavour?.split(' ')[0] || '?'} · B{r.batchNo?.slice(-5) || '?'}</span>
                    <span style={{ ...st.style, display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '7px', fontWeight: 700, letterSpacing: '0.5px', paddingLeft: '6px', paddingRight: '6px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '3px' }}>{st.lbl}</span>
                  </div>
                );
              }) : <div style={{ color: '#4caf50', fontSize: '10px', marginTop: '8px' }}>✔ All up to date</div>}
            </div>
          </div>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Line 4 Yield</div>
            <div style={{ position: 'relative', height: '100px' }}><canvas ref={l4ChartRef}></canvas></div>
          </div>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Line 3 Yield</div>
            <div style={{ position: 'relative', height: '100px' }}><canvas ref={l3ChartRef}></canvas></div>
          </div>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Line 2 Yield</div>
            <div style={{ position: 'relative', height: '100px' }}><canvas ref={l2ChartRef}></canvas></div>
          </div>
          <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '12px', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ color: '#6a8fc0', fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '10px', letterSpacing: '2px', marginBottom: '4px', textTransform: 'uppercase' }}>Line 1 Yield</div>
            <div style={{ position: 'relative', height: '100px' }}><canvas ref={l1ChartRef}></canvas></div>
          </div>
        </div>
      </div>
    </div>
  );
}
