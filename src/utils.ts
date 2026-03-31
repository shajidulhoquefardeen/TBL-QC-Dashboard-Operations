import { Run } from './types';
import { F15, F14 } from './constants';

export function calcYield(r: Partial<Run>) {
  const sku      = Number(r.sku) || 0;
  const pmxAmt   = Number(r.pmxAmount) || 0;
  const pmxVol   = pmxAmt * 19;
  const lineSyr  = Number(r.lineSyrupVol) || 0;
  const totalSyr = lineSyr + pmxVol;
  const lineFG   = Number(r.lineFG) || 0;
  const pmxFG    = Number(r.pmxFG)  || 0;
  const totalFG  = lineFG + pmxFG;

  if (!sku || !totalSyr || !totalFG) return {pmxVol, totalSyr, totalFG, denom: 0, yieldPct:0};

  const btls = sku===1000 ? 12 : sku===1750 ? 6 : 24;
  const flav = r.flavour || '';

  const ratio = F15(flav) ? 6 : F14(flav) ? 5 : 6;
  const denom = totalSyr / ((sku / ratio) * btls / 1000);
  const yieldPct = denom > 0 ? (totalFG / denom) * 100 : 0;

  return {pmxVol, totalSyr, totalFG, denom: Math.round(denom*10)/10, yieldPct};
}

export function getStatus(r: Partial<Run>) {
  const hasSyrup = (r.lineSyrupVol || 0) > 0;
  const hasFG    = (r.lineFG || 0) > 0;
  const hasMicro = r.tpc !== undefined && r.tpc !== null && r.tpc !== '';
  const days     = r.date ? (Date.now() - new Date(r.date).getTime()) / 86400000 : 0;
  if (hasSyrup && hasFG && hasMicro) return {code:'closed',    lbl:'✔ Closed',      cls:'', style: { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' }};
  if (hasSyrup && hasFG && days>=5)  return {code:'micro_due', lbl:'⚠ Micro Due',   cls:'', style: { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }};
  if (hasSyrup && hasFG)             return {code:'micro_pen', lbl:'⏳ Micro Pend.', cls:'', style: { backgroundColor: 'rgba(249, 115, 22, 0.15)', color: '#f97316', border: '1px solid rgba(249, 115, 22, 0.3)' }};
  return                                    {code:'started',   lbl:'▶ Running',      cls:'', style: { backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)' }};
}

export function yieldColor(p: number) {
  if(!p) return 'text-text-dim';
  if(p>=99 && p<=102) return 'text-green';
  if(p>=97) return 'text-amber';
  return 'text-red';
}

export function avgYield(arr: Partial<Run>[]) {
  let totalFG = 0;
  let totalDenom = 0;
  arr.forEach(r => {
    const y = calcYield(r);
    if (y.yieldPct > 0) {
      totalFG += y.totalFG;
      totalDenom += y.denom;
    }
  });
  return totalDenom > 0 ? (totalFG / totalDenom) * 100 : 0;
}

export function today() { return new Date().toISOString().slice(0,10); }
export function thisYear() { return new Date().getFullYear(); }
export function thisMonth() { return new Date().getMonth(); }

export function yrRuns(runs: Run[]) { return runs.filter(r => r.date && r.date.slice(0,4) === ''+thisYear()); }
export function mthRuns(runs: Run[]) { return runs.filter(r => { if(!r.date) return false; const d=new Date(r.date); return d.getFullYear()===thisYear()&&d.getMonth()===thisMonth(); }); }
export function todayRuns(runs: Run[]) { return runs.filter(r => r.date===today()); }
