import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAppContext } from '../store';
import { calcYield, avgYield, yrRuns, mthRuns, todayRuns, today, thisYear, thisMonth } from '../utils';
import { MONTHS, AIB_SCORES, EXT_LABS } from '../constants';

Chart.register(...registerables);

export function QCDashboard() {
  const { runs, sugarData, concData, dfData, extLabData, plantMetrics, theme } = useAppContext();
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

    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
    const textColor = theme === 'dark' ? '#64748b' : '#94a3b8';

    if (aibChartRef.current) {
      aibChart = new Chart(aibChartRef.current, {
        type: 'line',
        data: {
          labels: aibData.map(d => d.year),
          datasets: [
            { label: 'AIB Score', data: aibData.map(d => d.score), borderColor: '#f59e0b', backgroundColor: '#f59e0b18', tension: 0.4, fill: true, pointRadius: 2, borderWidth: 2 },
            { label: 'Superior(900)', data: Array(Math.max(12, aibData.length)).fill(900), borderColor: 'rgba(16, 185, 129, 0.5)', borderDash: [4, 3], borderWidth: 1, pointRadius: 0, fill: false }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } },
            y: { min: 800, max: 1000, ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } }
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
          datasets: [{ label: 'DF (Kg)', data: dfVals, backgroundColor: '#06b6d499', borderColor: '#06b6d4', borderWidth: 1, borderRadius: 2 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } },
            y: { min: 0, ticks: { color: textColor, font: { size: 8 } }, grid: { color: gridColor } }
          }
        }
      });
    }

    return () => {
      if (aibChart) aibChart.destroy();
      if (dfChart) dfChart.destroy();
    };
  }, [dfData, theme]);

  const getRingOffset = (pct: number) => {
    const norm = Math.min(100, Math.max(0, pct)) / 100;
    return 138 * (1 - norm);
  };

  const renderColorBadge = (color?: string | number) => {
    const c = typeof color === 'number' ? 'green' : String(color || '').toLowerCase();
    const base = "inline-block px-2 py-1 rounded-md font-condensed font-bold text-[10px] min-w-[65px] text-center uppercase tracking-wider shadow-sm transition-all hover:scale-105";
    if (c === 'blue') return <span className={`${base} bg-accent/20 text-accent border border-accent/30`}>Blue</span>;
    if (c === 'green') return <span className={`${base} bg-green/20 text-green border border-green/30`}>Green</span>;
    if (c === 'yellow') return <span className={`${base} bg-amber/20 text-amber border border-amber/30`}>Yellow</span>;
    if (c === 'red') return <span className={`${base} bg-red/20 text-red border border-red/30`}>Red</span>;
    return <span className={`${base} bg-navy-light text-text-muted border border-border`}>—</span>;
  };

  const renderPctBadge = (val: number | string, threshold = 99) => {
    const v = typeof val === 'string' ? parseFloat(val) : val;
    const isGood = v >= threshold;
    const base = "inline-block px-1 py-0.5 rounded-md font-condensed font-bold text-[10px] min-w-[38px] text-center shadow-sm transition-all hover:scale-105";
    if (!v && v !== 0) return <span className={`${base} bg-navy-light text-text-muted border border-border`}>—</span>;
    return (
      <span className={`${base} ${isGood ? 'bg-green/20 text-green border border-green/30' : 'bg-amber/20 text-amber border border-amber/30'}`}>
        {v.toFixed(1)}%
      </span>
    );
  };

  return (
    <div id="qc-dashboard" className="p-4 max-w-fit min-h-screen bg-navy text-text">
      {/* Header */}
      <div className="flex justify-between items-end mb-4 pb-3 border-b border-border">
        <div>
          <h1 className="font-condensed font-black text-xl tracking-tight uppercase text-text">Quality Control Dashboard</h1>
          <div className="flex items-center gap-4 mt-0.5">
            <div className="text-[10px] flex items-center gap-1.5 text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-green"></span>
              Chittagong Plant · <strong className="text-text">{n.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-md shadow-lg flex flex-col items-end bg-accent">
          <div className="text-[8px] uppercase font-bold tracking-widest text-white/70">Reporting Period</div>
          <div className="text-sm font-condensed font-black leading-none mt-0.5 text-white">{MONTHS[n.getMonth()]} {n.getFullYear()}</div>
        </div>
      </div>

      <div className="grid grid-cols-[310px_420px_340px] gap-3 justify-center items-stretch">
        {/* Column 1: 3C Scores */}
        <div className="flex flex-col gap-3">
          {/* Capability */}
          <div className="rounded-xl p-3 shadow-xl relative overflow-hidden group bg-navy-card border border-border">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
            <div className="font-condensed font-bold text-[10px] tracking-[2px] mb-3 uppercase flex justify-between items-center text-accent">
              <span>Capability Score</span>
              <span className="text-[8px] font-normal tracking-normal lowercase italic text-text-muted">updated: {plantMetrics?.updatedAt ? new Date(plantMetrics.updatedAt).toLocaleDateString() : '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg p-2 border bg-navy-light border-border">
                <div className="text-[8px] uppercase mb-1.5 text-center font-bold tracking-wider text-text-muted">EOY Status</div>
                <div className="flex justify-center">{renderColorBadge(plantMetrics?.capEoy)}</div>
              </div>
              <div className="rounded-lg p-2 border bg-navy-light border-border">
                <div className="text-[8px] uppercase mb-1.5 text-center font-bold tracking-wider text-text-muted">YTD Status</div>
                <div className="flex justify-center">{renderColorBadge(plantMetrics?.capYtd)}</div>
              </div>
            </div>
            <div className="space-y-2 rounded-lg p-2 border bg-navy-light border-border">
              <div className="flex justify-between items-center"><span className="text-[9px] font-semibold text-text-muted">Microbiological</span>{renderColorBadge(plantMetrics?.capMicro)}</div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-semibold text-text-muted">Analytical</span>{renderColorBadge(plantMetrics?.capAnalytical)}</div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-semibold text-text-muted">Sensory</span>{renderColorBadge(plantMetrics?.capSensory)}</div>
            </div>
          </div>

          {/* Control */}
          <div className="rounded-xl p-3 shadow-xl relative overflow-hidden group bg-navy-card border border-border">
            <div className="absolute top-0 left-0 w-1 h-full bg-green"></div>
            <div className="font-condensed font-bold text-[10px] tracking-[2px] mb-3 uppercase text-green">Control Score</div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-navy-light border-b border-border">
                    <th className="p-1.5 text-[7px] uppercase font-black tracking-widest text-text-muted">Period</th>
                    <th className="p-1.5 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">EOY</th>
                    <th className="p-1.5 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">YTD</th>
                    <th className="p-1.5 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">FG</th>
                    <th className="p-1.5 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">IW</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-border">
                  {[
                    { label: '12 Months', eoy: plantMetrics?.ctrl12Eoy, ytd: plantMetrics?.ctrl12Ytd, fg: plantMetrics?.ctrl12Fg, iw: plantMetrics?.ctrl12Iw },
                    { label: '6 Months', eoy: plantMetrics?.ctrl6Eoy, ytd: plantMetrics?.ctrl6Ytd, fg: plantMetrics?.ctrl6Fg, iw: plantMetrics?.ctrl6Iw },
                    { label: '1 Month', eoy: plantMetrics?.ctrl1Eoy, ytd: plantMetrics?.ctrl1Ytd, fg: plantMetrics?.ctrl1Fg, iw: plantMetrics?.ctrl1Iw }
                  ].map((row, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-navy-light">
                      <td className="p-1.5 text-[9px] font-bold leading-tight text-text-muted">{row.label}</td>
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
          <div className="rounded-xl p-3 shadow-xl relative overflow-hidden group flex-1 flex flex-col bg-navy-card border border-border">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber"></div>
            <div className="font-condensed font-bold text-[10px] tracking-[2px] mb-3 uppercase text-amber">Consumer Score</div>
            <div className="overflow-hidden rounded-lg border p-1 flex-1 flex flex-col justify-center border-border">
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="bg-navy-light border-b border-border">
                    <th className="p-1 text-[7px] uppercase font-black tracking-widest w-[18%] text-text-muted">Period</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">EOY</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">YTD</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">Sens</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">Torq</th>
                    <th className="p-1 text-center text-[7px] uppercase font-black tracking-widest text-text-muted">PA</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-border">
                  {[
                    { label: '12 Mo', eoy: plantMetrics?.cons12Eoy, ytd: plantMetrics?.cons12Ytd, sens: plantMetrics?.cons12Sensory, torq: plantMetrics?.cons12Torque, pa: plantMetrics?.cons12Pa },
                    { label: '6 Mo', eoy: plantMetrics?.cons6Eoy, ytd: plantMetrics?.cons6Ytd, sens: plantMetrics?.cons6Sensory, torq: plantMetrics?.cons6Torque, pa: plantMetrics?.cons6Pa },
                    { label: '1 Mo', eoy: plantMetrics?.cons1Eoy, ytd: plantMetrics?.cons1Ytd, sens: plantMetrics?.cons1Sensory, torq: plantMetrics?.cons1Torque, pa: plantMetrics?.cons1Pa }
                  ].map((row, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-navy-light">
                      <td className="p-1.5 text-[9px] font-bold truncate text-text-muted">{row.label}</td>
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
          <div className="rounded-xl p-3 shadow-xl bg-navy-card border border-border">
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 text-text-muted border-b border-border">Sugar Yield Performance</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'YTD', val: sytd, color: 'var(--color-green)' },
                { label: 'MTD', val: smtd, color: 'var(--color-green)' },
                { label: 'Today', val: sftd, color: 'var(--color-green)' }
              ].map((y, i) => (
                <div key={i} className="text-center">
                  <div className="relative inline-block mb-1">
                    <svg className="w-16 h-16" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" className="stroke-border" strokeWidth="4"/>
                      <circle cx="26" cy="26" r="22" fill="none" stroke={y.color} strokeWidth="4" strokeDasharray="138" strokeDashoffset={getRingOffset(y.val)} strokeLinecap="round" transform="rotate(-90 26 26)"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-text">{y.val.toFixed(1)}%</div>
                  </div>
                  <div className="text-[8px] uppercase font-bold text-text-muted">{y.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conc Yields */}
          <div className="rounded-xl p-3 shadow-xl bg-navy-card border border-border">
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 text-teal border-b border-border">Conc. Yield Performance</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'YTD', val: cytd, color: 'var(--color-teal)' },
                { label: 'MTD', val: cmtd, color: 'var(--color-teal)' },
                { label: 'Today', val: cftd, color: 'var(--color-teal)' }
              ].map((y, i) => (
                <div key={i} className="text-center">
                  <div className="relative inline-block mb-1">
                    <svg className="w-16 h-16" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" className="stroke-border" strokeWidth="4"/>
                      <circle cx="26" cy="26" r="22" fill="none" stroke={y.color} strokeWidth="4" strokeDasharray="138" strokeDashoffset={getRingOffset(y.val)} strokeLinecap="round" transform="rotate(-90 26 26)"/>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-teal">{y.val.toFixed(1)}%</div>
                  </div>
                  <div className="text-[8px] uppercase font-bold text-text-muted">{y.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DF Consumption */}
          <div className="rounded-xl p-3 shadow-xl bg-navy-card border border-border">
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 flex justify-between items-center text-text-muted">
              <span>DF Consumption</span>
              <span className="text-[7px] font-normal lowercase italic text-text-muted">(monthly kg)</span>
            </div>
            <div className="relative h-[110px]"><canvas ref={dfChartRef}></canvas></div>
          </div>

          {/* AIB & QAS Scores */}
          <div className="rounded-xl p-3 shadow-xl flex-1 flex flex-col bg-navy-card border border-border">
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 text-text-muted border-b border-border">🎯 AIB & QAS Performance</div>
            
            {/* AIB Trend Chart */}
            <div className="relative h-[100px] mb-3">
              <canvas ref={aibChartRef}></canvas>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="rounded-lg p-2 text-center flex flex-col justify-center bg-amber/10 border border-amber/20">
                <div className="text-[7px] uppercase font-bold mb-0.5 text-amber">AIB Score</div>
                <div className="font-condensed font-black text-lg text-amber">{aibScore}</div>
              </div>
              <div className="rounded-lg p-2 text-center flex flex-col justify-center bg-green/10 border border-green/20">
                <div className="text-[7px] uppercase font-bold mb-0.5 text-green">QAS Score</div>
                <div className="font-condensed font-black text-lg text-green">{qasScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Savings, Ext Lab, Environment, BSTI */}
        <div className="flex flex-col gap-3">
          {/* Financial Savings YTD */}
          <div className="rounded-xl p-3 shadow-xl bg-navy-card border border-border">
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 text-text-muted border-b border-border">Financial Savings YTD</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg border bg-navy-light border-border">
                <div className="text-[8px] font-bold uppercase mb-0.5 text-text-muted">Concentrate</div>
                <div className={`font-condensed font-black text-lg ${scoreSavings >= 0 ? 'text-green' : 'text-red'}`}>
                  {scoreSavings >= 0 ? '+' : '-'}৳ {Math.abs(scoreSavings).toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-lg border bg-navy-light border-border">
                <div className="text-[8px] font-bold uppercase mb-0.5 text-text-muted">Sugar</div>
                <div className={`font-condensed font-black text-lg ${sugarSaving >= 0 ? 'text-green' : 'text-red'}`}>
                  {sugarSaving >= 0 ? '+' : '-'}৳ {Math.abs(sugarSaving).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* External Lab Status */}
          <div className="rounded-xl p-3 shadow-xl bg-navy-card border border-border">
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 flex items-center gap-2 text-text-muted border-b border-border">
              <span>🔬 EXTERNAL LAB STATUS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(extLabData.length > 0 ? extLabData : EXT_LABS).map((el, i) => {
                const isExpired = el.expiry ? new Date() > new Date(el.expiry) : false;
                return (
                  <div key={i} className={`p-2 rounded-lg flex flex-col justify-center ${isExpired ? 'bg-red/5 border border-red/20' : 'bg-green/5 border border-green/20'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-[8px] font-bold uppercase leading-tight truncate mr-1 text-text">{el.label}</div>
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isExpired ? 'bg-red' : 'bg-green'}`}></div>
                    </div>
                    <div className="text-[8px] font-mono text-text-muted">EXP: {el.expiry}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environment (DOE) */}
          <div className="rounded-xl p-3 shadow-xl bg-navy-card border border-border">
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 flex justify-between items-center text-text-muted border-b border-border">
              <span>🌿 ENVIRONMENT (DOE)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-2 rounded-lg border text-center bg-navy-light border-border">
                <div className="text-[7px] uppercase font-bold mb-0.5 tracking-wider text-text-muted">Q1 Sampling & Date</div>
                <div className="text-[11px] font-mono font-black text-text">{plantMetrics?.doeEnvDetails?.samplingQ1 || 'N/A'}</div>
              </div>
              <div className="p-2 rounded-lg border text-center bg-navy-light border-border">
                <div className="text-[7px] uppercase font-bold mb-0.5 tracking-wider text-text-muted">Q2 Sampling & Date</div>
                <div className="text-[11px] font-mono font-black text-text">{plantMetrics?.doeEnvDetails?.samplingQ2 || 'N/A'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg border text-center bg-navy-light border-border">
                <div className="text-[7px] uppercase font-bold mb-0.5 tracking-wider text-text-muted">Licence Status</div>
                <div className={`text-[10px] font-black uppercase ${new Date() > new Date(plantMetrics?.doeEnvDetails?.licenceExpiry || '') ? 'text-red' : 'text-green'}`}>
                  {plantMetrics?.doeEnvDetails?.licenceExpiry ? (new Date() > new Date(plantMetrics.doeEnvDetails.licenceExpiry) ? 'Expired' : 'Valid') : 'N/A'}
                </div>
              </div>
              <div className="p-2 rounded-lg border text-center bg-navy-light border-border">
                <div className="text-[7px] uppercase font-bold mb-0.5 tracking-wider text-text-muted">Licence Expiry Date</div>
                <div className="text-[10px] font-mono font-black text-text">{plantMetrics?.doeEnvDetails?.licenceExpiry || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* BSTI Certification */}
          <div className="rounded-xl p-3 shadow-xl flex-1 flex flex-col bg-navy-card border border-border">
            <div className="text-[9px] uppercase font-bold tracking-widest mb-2 pb-1 text-text-muted border-b border-border">📜 BSTI Certification</div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              {(plantMetrics?.bstiList || []).map((cert, i) => {
                const isExpired = cert.dueDate ? new Date() > new Date(cert.dueDate) : false;
                return (
                  <div key={i} className="p-2 rounded-lg border h-full flex flex-col justify-center bg-navy-light border-border">
                    <div className="text-[8px] font-bold font-mono uppercase truncate text-text">{cert.name || 'Cert'}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-[7px] text-text-muted">Due: {cert.dueDate || 'N/A'}</div>
                      <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red' : 'bg-green'}`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 pt-1.5 flex justify-between items-center border-t border-border">
              <span className="text-[8px] uppercase font-bold text-text-muted">Last Visit</span>
              <strong className="text-[10px] font-mono text-text">{plantMetrics?.lastBstiVisit || '2026-03-12'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
