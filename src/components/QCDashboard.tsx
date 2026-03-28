import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAppContext } from '../store';
import { calcYield, avgYield, yrRuns, mthRuns, todayRuns, today, thisYear, thisMonth } from '../utils';
import { MONTHS, AIB_SCORES, EXT_LABS } from '../constants';

Chart.register(...registerables);

export function QCDashboard() {
  const { runs, sugarData, concData, dfData, extLabData, plantMetrics } = useAppContext();
  const aibChartRef = useRef<HTMLCanvasElement>(null);
  const dfChartRef = useRef<HTMLCanvasElement>(null);

  const n = new Date();
  const yr = yrRuns(runs);
  const mo = mthRuns(runs);
  const td = todayRuns(runs);

  const latestSugar = sugarData[0];
  const latestConc = concData[0];

  const cy_ytd = avgYield(yr);
  const cy_mtd = avgYield(mo);
  const cy_ftd = avgYield(td);

  const latestRun = runs.length > 0 ? runs[0] : null;

  const sytd = latestSugar?.ytd ?? (cy_ytd || 98.70);
  const smtd = latestSugar?.mtd ?? (cy_mtd || 99.70);
  const sftd = latestSugar?.ftd ?? (cy_ftd || 101.18);

  const cytd = latestConc?.ytd ?? (cy_ytd || 100.74);
  const cmtd = latestConc?.mtd ?? (cy_mtd || 101.00);
  const cftd = latestConc?.ftd ?? (cy_ftd || 101.75);

  const aibScore = plantMetrics?.aibqs || 925;
  const qasScore = plantMetrics?.qasScore ?? 100;
  const scoreSavings = plantMetrics?.scoreSavings || 259104;
  const sugarSaving = plantMetrics?.sugarSaving || -211311;

  const aibData = plantMetrics?.aibYearly?.length ? plantMetrics.aibYearly : AIB_SCORES.map(d => ({ year: d.y, score: d.s }));

  useEffect(() => {
    let aibChart: Chart | null = null;
    let dfChart: Chart | null = null;

    if (aibChartRef.current) {
      aibChart = new Chart(aibChartRef.current, {
        type: 'line',
        data: {
          labels: aibData.map(d => d.year),
          datasets: [
            { label: 'AIB Score', data: aibData.map(d => d.score), borderColor: '#ffc107', backgroundColor: '#ffc10718', tension: 0.4, fill: true, pointRadius: 2, borderWidth: 2 },
            { label: 'Superior(900)', data: Array(Math.max(12, aibData.length)).fill(900), borderColor: 'rgba(76,175,80,.5)', borderDash: [4, 3], borderWidth: 1, pointRadius: 0, fill: false }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } },
            y: { min: 800, max: 1000, ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } }
          }
        }
      });
    }

    if (dfChartRef.current) {
      // Map dfData to months
      const dfVals = MONTHS.map(m => {
        const entry = dfData.find(d => {
          const [y, mo] = d.month.split('-');
          return parseInt(mo, 10) - 1 === MONTHS.indexOf(m) && y === n.getFullYear().toString();
        });
        return entry ? entry.amount : 0;
      });

      dfChart = new Chart(dfChartRef.current, {
        type: 'bar',
        data: {
          labels: MONTHS,
          datasets: [{ label: 'DF (Kg)', data: dfVals, backgroundColor: '#00bcd499', borderColor: '#00bcd4', borderWidth: 1, borderRadius: 2 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } },
            y: { min: 0, ticks: { color: '#6a8fc0', font: { size: 8 } }, grid: { color: 'rgba(26,48,96,.7)' } }
          }
        }
      });
    }

    return () => {
      if (aibChart) aibChart.destroy();
      if (dfChart) dfChart.destroy();
    };
  }, [dfData]);

  const getRingOffset = (pct: number) => {
    const norm = Math.min(100, Math.max(0, pct)) / 100;
    return 138 * (1 - norm);
  };

  const renderColorBadge = (color?: string | number) => {
    const c = typeof color === 'number' ? 'green' : String(color || '').toLowerCase();
    const base = "inline-block px-2 py-1 rounded-md font-condensed font-bold text-[10px] min-w-[65px] text-center uppercase tracking-wider shadow-sm transition-all hover:scale-105";
    if (c === 'blue') return <span className={base} style={{ backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>Blue</span>;
    if (c === 'green') return <span className={base} style={{ backgroundColor: 'rgba(22, 163, 74, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>Green</span>;
    if (c === 'yellow') return <span className={base} style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Yellow</span>;
    if (c === 'red') return <span className={base} style={{ backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Red</span>;
    return <span className={base} style={{ backgroundColor: 'rgba(26, 47, 90, 0.5)', color: '#3a5a8a', border: '1px solid rgba(26, 48, 96, 0.5)' }}>—</span>;
  };

  const renderPctBadge = (val: number | string, threshold = 99) => {
    const v = typeof val === 'string' ? parseFloat(val) : val;
    const isGood = v >= threshold;
    const base = "inline-block px-1 py-0.5 rounded-md font-condensed font-bold text-[10px] min-w-[38px] text-center shadow-sm transition-all hover:scale-105";
    if (!v && v !== 0) return <span className={base} style={{ backgroundColor: 'rgba(26, 47, 90, 0.5)', color: '#3a5a8a', border: '1px solid rgba(26, 48, 96, 0.5)' }}>—</span>;
    return (
      <span className={base} style={{ 
        backgroundColor: isGood ? 'rgba(22, 163, 74, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
        color: isGood ? '#4ade80' : '#fbbf24', 
        border: isGood ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)' 
      }}>
        {v.toFixed(1)}%
      </span>
    );
  };

  return (
    <div id="qc-dashboard" className="p-4 max-w-fit min-h-screen" style={{ backgroundColor: '#0a0e17', color: '#ffffff' }}>
      {/* Header */}
      <div className="flex justify-between items-end mb-4 pb-3" style={{ borderBottom: '1px solid rgba(26, 48, 96, 0.3)' }}>
        <div>
          <h1 className="font-condensed font-black text-xl tracking-tight uppercase" style={{ color: '#dce8ff' }}>Quality Control Dashboard</h1>
          <div className="flex items-center gap-4 mt-0.5">
            <div className="text-[10px] flex items-center gap-1.5" style={{ color: '#6a8fc0' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }}></span>
              Chittagong Plant · <strong style={{ color: '#dce8ff' }}>{n.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-md shadow-lg flex flex-col items-end" style={{ backgroundColor: '#1565c0' }}>
          <div className="text-[8px] uppercase font-bold tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Reporting Period</div>
          <div className="text-sm font-condensed font-black leading-none mt-0.5" style={{ color: '#ffffff' }}>{MONTHS[n.getMonth()]} {n.getFullYear()}</div>
        </div>
      </div>

      <div className="grid grid-cols-[310px_420px_340px] gap-3 justify-center items-stretch">
        {/* Column 1: 3C Scores */}
        <div className="flex flex-col gap-3">
          {/* Capability */}
          <div className="rounded-xl p-3 shadow-xl relative overflow-hidden group" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: '#3b82f6' }}></div>
            <div className="font-condensed font-bold text-[10px] tracking-[2px] mb-3 uppercase flex justify-between items-center" style={{ color: '#60a5fa' }}>
              <span>Capability Score</span>
              <span className="text-[8px] font-normal tracking-normal lowercase italic" style={{ color: 'rgba(58, 90, 138, 1)' }}>updated: {plantMetrics?.updatedAt ? new Date(plantMetrics.updatedAt).toLocaleDateString() : '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg p-2 border" style={{ backgroundColor: 'rgba(26, 47, 90, 0.3)', borderColor: 'rgba(26, 48, 96, 0.5)' }}>
                <div className="text-[8px] uppercase mb-1.5 text-center font-bold tracking-wider" style={{ color: 'rgba(58, 90, 138, 1)' }}>EOY Status</div>
                <div className="flex justify-center">{renderColorBadge(plantMetrics?.capEoy)}</div>
              </div>
              <div className="rounded-lg p-2 border" style={{ backgroundColor: 'rgba(26, 47, 90, 0.3)', borderColor: 'rgba(26, 48, 96, 0.5)' }}>
                <div className="text-[8px] uppercase mb-1.5 text-center font-bold tracking-wider" style={{ color: 'rgba(58, 90, 138, 1)' }}>YTD Status</div>
                <div className="flex justify-center">{renderColorBadge(plantMetrics?.capYtd)}</div>
              </div>
            </div>
            <div className="space-y-2 rounded-lg p-2 border" style={{ backgroundColor: 'rgba(26, 47, 90, 0.2)', borderColor: 'rgba(26, 48, 96, 0.3)' }}>
              <div className="flex justify-between items-center"><span className="text-[9px] font-semibold" style={{ color: '#6a8fc0' }}>Microbiological</span>{renderColorBadge(plantMetrics?.capMicro)}</div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-semibold" style={{ color: '#6a8fc0' }}>Analytical</span>{renderColorBadge(plantMetrics?.capAnalytical)}</div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-semibold" style={{ color: '#6a8fc0' }}>Sensory</span>{renderColorBadge(plantMetrics?.capSensory)}</div>
            </div>
          </div>

          {/* Control */}
          <div className="rounded-xl p-3 shadow-xl relative overflow-hidden group" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: '#22c55e' }}></div>
            <div className="font-condensed font-bold text-[10px] tracking-[2px] mb-3 uppercase" style={{ color: '#4ade80' }}>Control Score</div>
            <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'rgba(26, 48, 96, 0.4)' }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(26, 47, 90, 0.4)', borderBottom: '1px solid rgba(26, 48, 96, 0.6)' }}>
                    <th className="p-1.5 text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>Period</th>
                    <th className="p-1.5 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>EOY</th>
                    <th className="p-1.5 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>YTD</th>
                    <th className="p-1.5 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>FG</th>
                    <th className="p-1.5 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>IW</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(26, 48, 96, 0.3)' }}>
                  {[
                    { label: '12 Months', eoy: plantMetrics?.ctrl12Eoy, ytd: plantMetrics?.ctrl12Ytd, fg: plantMetrics?.ctrl12Fg, iw: plantMetrics?.ctrl12Iw },
                    { label: '6 Months', eoy: plantMetrics?.ctrl6Eoy, ytd: plantMetrics?.ctrl6Ytd, fg: plantMetrics?.ctrl6Fg, iw: plantMetrics?.ctrl6Iw },
                    { label: '1 Month', eoy: plantMetrics?.ctrl1Eoy, ytd: plantMetrics?.ctrl1Ytd, fg: plantMetrics?.ctrl1Fg, iw: plantMetrics?.ctrl1Iw }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ transition: 'background-color 0.2s' }} className="hover:bg-[rgba(26,47,90,0.1)]">
                      <td className="p-1.5 text-[9px] font-bold leading-tight" style={{ color: '#6a8fc0' }}>{row.label}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.eoy)}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.ytd)}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.fg)}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.iw)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consumer */}
          <div className="rounded-xl p-3 shadow-xl relative overflow-hidden group flex-1 flex flex-col" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <div className="font-condensed font-bold text-[10px] tracking-[2px] mb-3 uppercase" style={{ color: '#fbbf24' }}>Consumer Score</div>
            <div className="overflow-hidden rounded-lg border p-1 flex-1 flex flex-col justify-center" style={{ borderColor: 'rgba(26, 48, 96, 0.4)' }}>
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(26, 47, 90, 0.4)', borderBottom: '1px solid rgba(26, 48, 96, 0.6)' }}>
                    <th className="p-1 text-[7px] uppercase font-black tracking-widest w-[18%]" style={{ color: 'rgba(58, 90, 138, 1)' }}>Period</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>EOY</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>YTD</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>Sens</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>Torq</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest" style={{ color: 'rgba(58, 90, 138, 1)' }}>PA</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(26, 48, 96, 0.3)' }}>
                  {[
                    { label: '12 Mo', eoy: plantMetrics?.cons12Eoy, ytd: plantMetrics?.cons12Ytd, sens: plantMetrics?.cons12Sensory, torq: plantMetrics?.cons12Torque, pa: plantMetrics?.cons12Pa },
                    { label: '6 Mo', eoy: plantMetrics?.cons6Eoy, ytd: plantMetrics?.cons6Ytd, sens: plantMetrics?.cons6Sensory, torq: plantMetrics?.cons6Torque, pa: plantMetrics?.cons6Pa },
                    { label: '1 Mo', eoy: plantMetrics?.cons1Eoy, ytd: plantMetrics?.cons1Ytd, sens: plantMetrics?.cons1Sensory, torq: plantMetrics?.cons1Torque, pa: plantMetrics?.cons1Pa }
                  ].map((row, idx) => (
                    <tr key={idx} style={{ transition: 'background-color 0.2s' }} className="hover:bg-[rgba(26,47,90,0.1)]">
                      <td className="p-1.5 text-[9px] font-bold truncate" style={{ color: '#6a8fc0' }}>{row.label}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.eoy, 98)}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.ytd, 98)}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.sens, 98)}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.torq, 98)}</td>
                      <td className="p-1.5 text-center">{renderPctBadge(row.pa, 98)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Column 2: Yields, DF, AIB */}
        <div className="flex flex-col gap-3">
          {/* Sugar Yields */}
          <div className="rounded-xl p-3 shadow-xl" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1" style={{ color: '#6a8fc0', borderBottom: '1px solid rgba(26, 48, 96, 1)' }}>Sugar Yield Performance</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'YTD', val: sytd, color: '#4caf50' },
                { label: 'MTD', val: smtd, color: '#4caf50' },
                { label: 'Today', val: sftd, color: '#4caf50' }
              ].map((y, i) => (
                <div key={i} className="text-center">
                  <div className="relative inline-block mb-1">
                    <svg className="w-16 h-16" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(26,48,96,.8)" strokeWidth="4"/>
                      <circle cx="26" cy="26" r="22" fill="none" stroke={y.color} strokeWidth="4" strokeDasharray="138" strokeDashoffset={getRingOffset(y.val)} strokeLinecap="round" transform="rotate(-90 26 26)"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black" style={{ color: '#dce8ff' }}>{y.val.toFixed(1)}%</div>
                  </div>
                  <div className="text-[8px] uppercase font-bold" style={{ color: 'rgba(58, 90, 138, 1)' }}>{y.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conc Yields */}
          <div className="rounded-xl p-3 shadow-xl" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1" style={{ color: '#2dd4bf', borderBottom: '1px solid rgba(26, 48, 96, 1)' }}>Conc. Yield Performance</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'YTD', val: cytd, color: '#00bcd4' },
                { label: 'MTD', val: cmtd, color: '#00bcd4' },
                { label: 'Today', val: cftd, color: '#00bcd4' }
              ].map((y, i) => (
                <div key={i} className="text-center">
                  <div className="relative inline-block mb-1">
                    <svg className="w-16 h-16" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(26,48,96,.8)" strokeWidth="4"/>
                      <circle cx="26" cy="26" r="22" fill="none" stroke={y.color} strokeWidth="4" strokeDasharray="138" strokeDashoffset={getRingOffset(y.val)} strokeLinecap="round" transform="rotate(-90 26 26)"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black" style={{ color: '#2dd4bf' }}>{y.val.toFixed(1)}%</div>
                  </div>
                  <div className="text-[8px] uppercase font-bold" style={{ color: 'rgba(58, 90, 138, 1)' }}>{y.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DF Consumption */}
          <div className="rounded-xl p-3 shadow-xl" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 flex justify-between items-center" style={{ color: '#6a8fc0' }}>
              <span>DF Consumption</span>
              <span className="text-[7px] font-normal lowercase italic" style={{ color: 'rgba(58, 90, 138, 1)' }}>(monthly kg)</span>
            </div>
            <div className="relative h-[110px]"><canvas ref={dfChartRef}></canvas></div>
          </div>

          {/* AIB & QAS Scores */}
          <div className="rounded-xl p-3 shadow-xl flex-1 flex flex-col" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1" style={{ color: '#6a8fc0', borderBottom: '1px solid rgba(26, 48, 96, 1)' }}>🎯 AIB & QAS Performance</div>
            
            {/* AIB Trend Chart */}
            <div className="relative h-[100px] mb-3">
              <canvas ref={aibChartRef}></canvas>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }} className="rounded-lg p-2 text-center flex flex-col justify-center">
                <div className="text-[7px] uppercase font-bold mb-0.5" style={{ color: '#fbbf24' }}>AIB Score</div>
                <div className="font-condensed font-black text-lg" style={{ color: '#f59e0b' }}>{aibScore}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }} className="rounded-lg p-2 text-center flex flex-col justify-center">
                <div className="text-[7px] uppercase font-bold mb-0.5" style={{ color: '#4ade80' }}>QAS Score</div>
                <div className="font-condensed font-black text-lg" style={{ color: '#22c55e' }}>{qasScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Savings, Ext Lab, Environment, BSTI */}
        <div className="flex flex-col gap-3">
          {/* Financial Savings YTD */}
          <div className="rounded-xl p-3 shadow-xl" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1" style={{ color: '#6a8fc0', borderBottom: '1px solid rgba(26, 48, 96, 1)' }}>Financial Savings YTD</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg border" style={{ backgroundColor: 'rgba(26, 47, 90, 0.2)', borderColor: 'rgba(26, 48, 96, 0.4)' }}>
                <div className="text-[8px] font-bold uppercase mb-0.5" style={{ color: 'rgba(58, 90, 138, 1)' }}>Concentrate</div>
                <div className="font-condensed font-black text-lg" style={{ color: scoreSavings >= 0 ? '#4ade80' : '#f87171' }}>
                  {scoreSavings >= 0 ? '+' : '-'}৳ {Math.abs(scoreSavings).toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-lg border" style={{ backgroundColor: 'rgba(26, 47, 90, 0.2)', borderColor: 'rgba(26, 48, 96, 0.4)' }}>
                <div className="text-[8px] font-bold uppercase mb-0.5" style={{ color: 'rgba(58, 90, 138, 1)' }}>Sugar</div>
                <div className="font-condensed font-black text-lg" style={{ color: sugarSaving >= 0 ? '#4ade80' : '#f87171' }}>
                  {sugarSaving >= 0 ? '+' : '-'}৳ {Math.abs(sugarSaving).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* External Lab Status */}
          <div className="rounded-xl p-3 shadow-xl" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 flex items-center gap-2" style={{ color: '#6a8fc0', borderBottom: '1px solid rgba(26, 48, 96, 1)' }}>
              <span>🔬 EXTERNAL LAB STATUS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(extLabData.length > 0 ? extLabData : EXT_LABS).map((el, i) => {
                const isExpired = el.expiry ? new Date() > new Date(el.expiry) : false;
                return (
                  <div key={i} style={{ backgroundColor: isExpired ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)', border: isExpired ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)' }} className="p-2 rounded-lg flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-[8px] font-bold uppercase leading-tight truncate mr-1" style={{ color: '#dce8ff' }}>{el.label}</div>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isExpired ? '#ef4444' : '#22c55e' }}></div>
                    </div>
                    <div className="text-[8px] font-mono" style={{ color: 'rgba(58, 90, 138, 1)' }}>EXP: {el.expiry}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environment (DOE) */}
          <div className="rounded-xl p-3 shadow-xl" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 flex justify-between items-center" style={{ color: '#6a8fc0', borderBottom: '1px solid rgba(26, 48, 96, 1)' }}>
              <span>🌿 ENVIRONMENT (DOE)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg border text-center" style={{ backgroundColor: 'rgba(26, 47, 90, 0.3)', borderColor: 'rgba(26, 48, 96, 0.5)' }}>
                <div className="text-[8px] uppercase font-bold mb-0.5 tracking-wider" style={{ color: 'rgba(58, 90, 138, 1)' }}>Q1</div>
                <div className="text-sm font-mono font-black" style={{ color: '#dce8ff' }}>{plantMetrics?.doeEnvDetails?.samplingQ1 || 'N/A'}</div>
              </div>
              <div className="p-2 rounded-lg border text-center" style={{ backgroundColor: 'rgba(26, 47, 90, 0.3)', borderColor: 'rgba(26, 48, 96, 0.5)' }}>
                <div className="text-[8px] uppercase font-bold mb-0.5 tracking-wider" style={{ color: 'rgba(58, 90, 138, 1)' }}>Q2</div>
                <div className="text-sm font-mono font-black" style={{ color: '#dce8ff' }}>{plantMetrics?.doeEnvDetails?.samplingQ2 || 'N/A'}</div>
              </div>
              <div className="p-2 rounded-lg border text-center" style={{ backgroundColor: 'rgba(26, 47, 90, 0.3)', borderColor: 'rgba(26, 48, 96, 0.5)' }}>
                <div className="text-[8px] uppercase font-bold mb-0.5 tracking-wider" style={{ color: 'rgba(58, 90, 138, 1)' }}>Expiry</div>
                <div className="text-xs font-mono font-black" style={{ color: new Date() > new Date(plantMetrics?.doeEnvDetails?.licenceExpiry || '') ? '#f87171' : '#4ade80' }}>
                  {plantMetrics?.doeEnvDetails?.licenceExpiry || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* BSTI Certification */}
          <div className="rounded-xl p-3 shadow-xl flex-1 flex flex-col" style={{ backgroundColor: '#132244', border: '1px solid rgba(26, 48, 96, 1)' }}>
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1" style={{ color: '#6a8fc0', borderBottom: '1px solid rgba(26, 48, 96, 1)' }}>📜 BSTI Certification</div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              {(plantMetrics?.bstiList || []).map((cert, i) => {
                const isExpired = cert.dueDate ? new Date() > new Date(cert.dueDate) : false;
                return (
                  <div key={i} className="p-2 rounded-lg border h-full flex flex-col justify-center" style={{ backgroundColor: 'rgba(26, 47, 90, 0.2)', borderColor: 'rgba(26, 48, 96, 0.3)' }}>
                    <div className="text-[8px] font-bold font-mono uppercase truncate" style={{ color: '#dce8ff' }}>{cert.name || 'Cert'}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-[7px]" style={{ color: 'rgba(58, 90, 138, 1)' }}>Due: {cert.dueDate || 'N/A'}</div>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isExpired ? '#ef4444' : '#22c55e' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-1.5 flex justify-between items-center" style={{ borderTop: '1px solid rgba(26, 48, 96, 0.5)' }}>
              <span className="text-[8px] uppercase font-bold" style={{ color: 'rgba(58, 90, 138, 1)' }}>Last Visit</span>
              <strong className="text-[10px] font-mono" style={{ color: '#dce8ff' }}>{plantMetrics?.lastBstiVisit || '2026-03-12'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
