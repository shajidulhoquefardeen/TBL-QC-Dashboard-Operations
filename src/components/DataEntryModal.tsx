import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { LINES, FLAVOURS, CHEMISTS } from '../constants';
import { today } from '../utils';
import { PlantSettingsModal } from './PlantSettingsModal';

export function DataEntryModal() {
  const { isModalOpen, closeModal, editId, runs, saveRun, prefillLine, customSettings, role } = useAppContext();

  const [activeTab, setActiveTab] = useState(1);
  const [settingsModal, setSettingsModal] = useState<{ isOpen: boolean; category: string; label: string }>({ isOpen: false, category: '', label: '' });
  const [formData, setFormData] = useState({
    id: '', date: today(), shift: '', line: '', batchNo: '', flavour: '', sku: '',
    chemistStartup: '', chemistEndup: '',
    lineSyrupVol: '', pmxAmount: '',
    lineFG: '', pmxFG: '',
    startTime: '', endTime: '', endDate: '',
    tpc: '', yeast: '', mold: '', coliform: 'Absent', microDate: '',
    microResult: 'Pending', deviation: 'None', remarks: '',
    isLocked: false,
    bsti: '', sugarYield: '', concYield: '', scoreSavings: '',
    doeEnv: '', aibqs: '', extLabTest: '', dfConsumption: ''
  });

  useEffect(() => {
    if (isModalOpen) {
      setActiveTab(1);
      if (editId) {
        const run = runs.find(r => r.id === editId);
        if (run) {
          setFormData({
            id: run.id, date: run.date || today(), shift: run.shift || '', line: run.line || '', batchNo: run.batchNo || '',
            flavour: run.flavour || '', sku: run.sku?.toString() || '',
            chemistStartup: run.chemistStartup || '', chemistEndup: run.chemistEndup || '',
            lineSyrupVol: run.lineSyrupVol?.toString() || '', pmxAmount: run.pmxAmount?.toString() || '',
            lineFG: run.lineFG?.toString() || '', pmxFG: run.pmxFG?.toString() || '',
            startTime: run.startTime || '', endTime: run.endTime || '', endDate: run.endDate || '',
            tpc: run.tpc?.toString() || '', yeast: run.yeast?.toString() || '', mold: run.mold?.toString() || '',
            coliform: run.coliform || 'Absent', microDate: run.microDate || '',
            microResult: run.microResult || 'Pending', deviation: run.deviation || 'None', remarks: run.remarks || '',
            isLocked: run.isLocked || false,
            bsti: run.bsti || '', sugarYield: run.sugarYield?.toString() || '', concYield: run.concYield?.toString() || '',
            scoreSavings: run.scoreSavings?.toString() || '', doeEnv: run.doeEnv || '', aibqs: run.aibqs?.toString() || '',
            extLabTest: run.extLabTest || '', dfConsumption: run.dfConsumption?.toString() || ''
          });
        }
      } else {
        setFormData({
          id: '', date: today(), shift: '', line: prefillLine || '', batchNo: '', flavour: '', sku: '',
          chemistStartup: '', chemistEndup: '',
          lineSyrupVol: '', pmxAmount: '',
          lineFG: '', pmxFG: '',
          startTime: '', endTime: '', endDate: '',
          tpc: '', yeast: '', mold: '', coliform: 'Absent', microDate: '',
          microResult: 'Pending', deviation: 'None', remarks: '',
          isLocked: false
        });
      }
    }
  }, [isModalOpen, editId, runs, prefillLine]);

  useEffect(() => {
    const pmxAmt = Number(formData.pmxAmount) || 0;
    const skuNum = Number(formData.sku) || 0;
    const flav = formData.flavour || '';

    if (pmxAmt > 0 && skuNum > 0 && flav) {
      const pmxVol = pmxAmt * 19;
      const isF15 = ['pepsi','7up','7-up','dew'].some(k => flav.toLowerCase().includes(k));
      const isF14 = ['mirinda','sting'].some(k => flav.toLowerCase().includes(k));
      const ratio = isF15 ? 6 : isF14 ? 5 : 6;
      const btls = skuNum === 1000 ? 12 : skuNum === 1750 ? 6 : 24;
      const calculatedPmxFG = pmxVol / ((skuNum / ratio) * btls / 1000);
      
      setFormData(prev => ({ ...prev, pmxFG: calculatedPmxFG.toFixed(1) }));
    } else if (pmxAmt === 0) {
      setFormData(prev => ({ ...prev, pmxFG: '0' }));
    }
  }, [formData.pmxAmount, formData.sku, formData.flavour]);

  if (!isModalOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSettingsClick = (category: string, label: string) => {
    setSettingsModal({ isOpen: true, category, label });
  };

  const isTab1Valid = formData.date && formData.shift && formData.line && formData.batchNo && formData.chemistStartup && formData.flavour && formData.sku;
  const isTab2Valid = isTab1Valid && (formData.lineSyrupVol || formData.lineFG);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isTab1Valid) {
      alert('Please fill in all required fields in Startup Info.');
      setActiveTab(1);
      return;
    }

    const runData = {
      id: formData.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
      date: formData.date,
      shift: formData.shift,
      line: formData.line,
      batchNo: formData.batchNo,
      flavour: formData.flavour,
      sku: formData.sku ? Number(formData.sku) : 0,
      chemistStartup: formData.chemistStartup,
      chemistEndup: formData.chemistEndup,
      lineSyrupVol: formData.lineSyrupVol ? Number(formData.lineSyrupVol) : 0,
      pmxAmount: formData.pmxAmount ? Number(formData.pmxAmount) : 0,
      lineFG: formData.lineFG ? Number(formData.lineFG) : 0,
      pmxFG: formData.pmxFG ? Number(formData.pmxFG) : 0,
      startTime: formData.startTime,
      endTime: formData.endTime,
      endDate: formData.endDate,
      tpc: formData.tpc ? Number(formData.tpc) : '',
      yeast: formData.yeast ? Number(formData.yeast) : '',
      mold: formData.mold ? Number(formData.mold) : '',
      coliform: formData.coliform,
      microDate: formData.microDate,
      microResult: formData.microResult,
      deviation: formData.deviation,
      remarks: formData.remarks,
      isLocked: formData.isLocked,
      updatedAt: new Date().toISOString(),
      createdAt: formData.id ? (runs.find(r => r.id === formData.id)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    saveRun(runData);
    closeModal();
  };

  const allLines = customSettings.lines || [];
  const allFlavours = customSettings.flavours || [];
  const allChemists = customSettings.chemists || [];
  const allSkus = customSettings.skus || [];
  const allShifts = customSettings.shifts || [];
  const allColiforms = customSettings.coliforms || [];
  const allMicroResults = customSettings.microResults || [];
  const allDeviations = customSettings.deviations || [];

  const pmxVol = (Number(formData.pmxAmount) || 0) * 19;
  const totalSyrup = (Number(formData.lineSyrupVol) || 0) + pmxVol;
  const totalFG = (Number(formData.lineFG) || 0) + (Number(formData.pmxFG) || 0);
  const isLocked = formData.isLocked && role !== 'superadmin';
  
  // Calculate expected FG (denom)
  let expectedFG = 0;
  if (formData.flavour && formData.sku && totalSyrup > 0) {
    const skuNum = Number(formData.sku);
    const isF15 = ['pepsi','7up','7-up','dew'].some(k => String(formData.flavour||'').toLowerCase().includes(k));
    const isF14 = ['mirinda','sting'].some(k => String(formData.flavour||'').toLowerCase().includes(k));
    const ratio = isF15 ? 6 : isF14 ? 5 : 6;
    const btls = skuNum === 1000 ? 12 : skuNum === 1750 ? 6 : 24;
    expectedFG = totalSyrup / ((skuNum / ratio) * btls / 1000);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden" style={{ backgroundColor: '#132244', border: '1px solid #1a3060' }}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderBottom: '1px solid #1a3060', backgroundColor: '#0a1628' }}>
          <h2 className="font-condensed font-bold text-xl" style={{ color: '#dce8ff' }}>{editId ? `Edit Run - ${formData.batchNo || editId}` : 'New Run Entry'}</h2>
          <button type="button" className="transition-colors hover:text-accent" style={{ color: '#6a8fc0' }} onClick={() => closeModal()}>✕</button>
        </div>
        
        <div className="flex border-b px-4 pt-2" style={{ borderBottom: '1px solid #1a3060', backgroundColor: 'rgba(10, 22, 40, 0.5)' }}>
          <button type="button" className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 1 ? '' : 'hover:text-text'}`} 
            style={{ 
              borderColor: activeTab === 1 ? '#00e5ff' : 'transparent', 
              color: activeTab === 1 ? '#00e5ff' : '#6a8fc0' 
            }} 
            onClick={() => setActiveTab(1)}>1 • Startup Info</button>
          <button type="button" className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 2 ? '' : 'hover:text-text'} ${!isTab1Valid ? 'opacity-50 cursor-not-allowed' : ''}`} 
            style={{ 
              borderColor: activeTab === 2 ? '#00e5ff' : 'transparent', 
              color: activeTab === 2 ? '#00e5ff' : '#6a8fc0' 
            }} 
            onClick={() => isTab1Valid && setActiveTab(2)}>2 • Production Data</button>
          <button type="button" className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 3 ? '' : 'hover:text-text'} ${!isTab2Valid ? 'opacity-50 cursor-not-allowed' : ''}`} 
            style={{ 
              borderColor: activeTab === 3 ? '#00e5ff' : 'transparent', 
              color: activeTab === 3 ? '#00e5ff' : '#6a8fc0' 
            }} 
            onClick={() => isTab2Valid && setActiveTab(3)}>3 • Micro Results</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <form id="run-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
            <fieldset disabled={isLocked} className="flex flex-col gap-6">
            
            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Start Date *</label>
                  <input type="date" name="date" className="finp" value={formData.date} onChange={handleChange} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Shift * <button type="button" onClick={() => handleSettingsClick('shifts', 'Shift')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                  <select name="shift" className="finp" value={formData.shift} onChange={handleChange} required>
                    <option value="">—Select—</option>
                    {allShifts.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Line * <button type="button" onClick={() => handleSettingsClick('lines', 'Line')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                  <select name="line" className="finp" value={formData.line} onChange={handleChange} required>
                    <option value="">—Select—</option>
                    {allLines.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Batch No. *</label>
                  <input type="text" name="batchNo" className="finp" placeholder="e.g. B2026-0316-L3-1" value={formData.batchNo} onChange={handleChange} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Chemist Startup * <button type="button" onClick={() => handleSettingsClick('chemists', 'Chemist')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                  <select name="chemistStartup" className="finp" value={formData.chemistStartup} onChange={handleChange} required>
                    <option value="">—Select—</option>
                    {allChemists.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Chemist Endup <button type="button" onClick={() => handleSettingsClick('chemists', 'Chemist')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                  <select name="chemistEndup" className="finp" value={formData.chemistEndup} onChange={handleChange}>
                    <option value="">—Same / Not ended yet—</option>
                    {allChemists.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Flavour * <button type="button" onClick={() => handleSettingsClick('flavours', 'Flavour')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                  <select name="flavour" className="finp" value={formData.flavour} onChange={handleChange} required>
                    <option value="">—Select—</option>
                    {allFlavours.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>SKU (ml) * <button type="button" onClick={() => handleSettingsClick('skus', 'SKU')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                  <select name="sku" className="finp" value={formData.sku} onChange={handleChange} required>
                    <option value="">—Select—</option>
                    {allSkus.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="flex flex-col gap-5">
                <div className="border rounded p-3 text-sm" style={{ backgroundColor: '#0a1628', border: '1px solid #1a3060', color: '#6a8fc0' }}>
                  {formData.line || 'Line'} - {formData.flavour || 'Flavour'} - {formData.sku ? formData.sku + 'ml' : 'SKU'} - Batch: <strong style={{ color: '#dce8ff' }}>{formData.batchNo || '(not set)'}</strong> | Start: {formData.chemistStartup || '(not set)'} | End: {formData.chemistEndup || '(not set)'}
                </div>
                <div className="rounded p-3 text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#ffc107' }}>
                  💡 Enter the production data when the run ends. This can be updated later if the run spans multiple shifts or days.
                </div>

                <div>
                  <h3 className="font-condensed font-semibold text-[13px] tracking-[1.5px] uppercase mb-3" style={{ color: '#6a8fc0' }}>Syrup Input</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Line Syrup Volume (L) *</label>
                      <input type="number" name="lineSyrupVol" className="finp" value={formData.lineSyrupVol} onChange={handleChange} required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>PMX Amount (boxes)</label>
                      <input type="number" name="pmxAmount" className="finp" value={formData.pmxAmount} onChange={handleChange} />
                      <span className="text-[9px]" style={{ color: '#6a8fc0' }}>1 box = 19 Litres</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>PMX Volume (L)</label>
                      <input type="number" className="finp" style={{ backgroundColor: '#0f1f3d' }} value={pmxVol || ''} readOnly />
                      <span className="text-[9px]" style={{ color: '#14b8a6' }}>PMX {formData.pmxAmount || 0} × 19 = {pmxVol.toFixed(1)}L</span>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Total Syrup Volume (L)</label>
                      <input type="number" className="finp" style={{ backgroundColor: '#0f1f3d' }} value={totalSyrup || ''} readOnly />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Start Time</label>
                      <input type="time" name="startTime" className="finp" value={formData.startTime} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-condensed font-semibold text-[13px] tracking-[1.5px] uppercase mb-3" style={{ color: '#6a8fc0' }}>Finished Goods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Line FG (cases) *</label>
                      <input type="number" name="lineFG" className="finp" value={formData.lineFG} onChange={handleChange} required />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>PMX FG (cases) <span className="px-1 rounded text-[9px]" style={{ backgroundColor: 'rgba(20, 184, 166, 0.2)', color: '#14b8a6' }}>AUTO</span></label>
                      <input type="number" name="pmxFG" className="finp" style={{ backgroundColor: '#0f1f3d' }} value={formData.pmxFG} readOnly />
                      <span className="text-[9px]" style={{ color: '#14b8a6' }}>Select Flavour + SKU + enter PMX Amount</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Total FG (cases)</label>
                      <input type="number" className="finp" style={{ backgroundColor: '#0f1f3d' }} value={totalFG || ''} readOnly />
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>End Date</label>
                      <input type="date" name="endDate" className="finp" value={formData.endDate} onChange={handleChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>End Time</label>
                      <input type="time" name="endTime" className="finp" value={formData.endTime} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="border rounded p-4" style={{ backgroundColor: '#0a1628', border: '1px solid #1a3060' }}>
                  <h3 className="font-condensed font-semibold text-[11px] tracking-[1.5px] uppercase mb-3" style={{ color: '#6a8fc0' }}>▶ LIVE YIELD CALCULATION</h3>
                  <div className="grid grid-cols-5 text-center">
                    <div>
                      <div className="text-xl font-bold" style={{ color: '#14b8a6' }}>{pmxVol.toFixed(1)}L</div>
                      <div className="text-[10px]" style={{ color: '#6a8fc0' }}>PMX Syrup</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold" style={{ color: '#14b8a6' }}>{totalSyrup.toFixed(1)}L</div>
                      <div className="text-[10px]" style={{ color: '#6a8fc0' }}>Total Syrup</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold" style={{ color: '#14b8a6' }}>{totalFG.toFixed(1)} cs</div>
                      <div className="text-[10px]" style={{ color: '#6a8fc0' }}>Total FG</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold" style={{ color: '#6a8fc0' }}>{expectedFG > 0 ? expectedFG.toFixed(1) : '—'}</div>
                      <div className="text-[10px]" style={{ color: '#6a8fc0' }}>Expected (denom)</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold" style={{ color: expectedFG > 0 ? (totalFG / expectedFG >= 0.99 && totalFG / expectedFG <= 1.02 ? '#4caf50' : '#ffc107') : '#6a8fc0' }}>
                        {expectedFG > 0 ? ((totalFG / expectedFG) * 100).toFixed(2) + '%' : '—'}
                      </div>
                      <div className="text-[10px]" style={{ color: '#6a8fc0' }}>Yield %</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="flex flex-col gap-5">
                <div className="rounded p-3 text-sm flex items-center gap-2" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#ffc107' }}>
                  ⏳ Microbiological results take ~5 days. Save the run first — come back to update these results via the Records page (Edit → Update Micro).
                </div>

                <div>
                  <h3 className="font-condensed font-semibold text-[13px] tracking-[1.5px] uppercase mb-3" style={{ color: '#6a8fc0' }}>Microbiological</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>TPC (cfu/ml)</label>
                      <input type="number" name="tpc" className="finp" value={formData.tpc} onChange={handleChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Yeast (cfu/ml)</label>
                      <input type="number" name="yeast" className="finp" value={formData.yeast} onChange={handleChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Mold (cfu/ml)</label>
                      <input type="number" name="mold" className="finp" value={formData.mold} onChange={handleChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Coliform <button type="button" onClick={() => handleSettingsClick('coliforms', 'Coliform Option')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                      <select name="coliform" className="finp" value={formData.coliform} onChange={handleChange}>
                        <option value="">—Select—</option>
                        {allColiforms.map((c: string) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Micro Test Date</label>
                      <input type="date" name="microDate" className="finp" value={formData.microDate} onChange={handleChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Overall Micro Result <button type="button" onClick={() => handleSettingsClick('microResults', 'Micro Result')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                      <select name="microResult" className="finp" value={formData.microResult} onChange={handleChange}>
                        <option value="">—Select—</option>
                        {allMicroResults.map((m: string) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[11px] flex items-center gap-1" style={{ color: '#6a8fc0' }}>Deviation Code <button type="button" onClick={() => handleSettingsClick('deviations', 'Deviation Code')} className="hover:text-accent" style={{ color: '#6a8fc0' }}>⚙️</button></label>
                      <select name="deviation" className="finp" value={formData.deviation} onChange={handleChange}>
                        <option value="">—Select—</option>
                        {allDeviations.map((d: string) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 md:col-span-3">
                      <label className="text-[11px]" style={{ color: '#6a8fc0' }}>Remarks / Observations</label>
                      <textarea name="remarks" className="finp min-h-[80px] resize-y" placeholder="Any deviations, observations, or corrective actions..." value={formData.remarks} onChange={handleChange}></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}

            </fieldset>
          </form>
        </div>

        <div className="p-4 border-t flex justify-end gap-3" style={{ borderTop: '1px solid #1a3060', backgroundColor: '#0a1628' }}>
          {formData.isLocked && (
            <div className="mr-auto flex items-center gap-2 text-[11px] font-semibold" style={{ color: '#ffc107' }}>
              <span>🔒</span> This record is locked.
            </div>
          )}
          <button type="button" className="px-4 py-2 rounded text-sm font-semibold border transition-colors hover:text-text hover:bg-navy-light" style={{ border: '1px solid #1a3060', color: '#6a8fc0' }} onClick={() => closeModal()}>Cancel</button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={isLocked}
            className={`px-5 py-2 rounded text-sm font-semibold text-white transition-colors shadow-lg flex items-center gap-2 ${isLocked ? 'bg-gray-600 cursor-not-allowed opacity-50' : ''}`}
            style={{ 
              backgroundColor: isLocked ? undefined : '#4caf50',
              boxShadow: isLocked ? undefined : '0 10px 15px -3px rgba(76, 175, 80, 0.2)'
            }}
          >
            <span>💾</span> {isLocked ? 'Locked' : 'Save'}
          </button>
        </div>

        <PlantSettingsModal 
          isOpen={settingsModal.isOpen} 
          onClose={() => setSettingsModal({ ...settingsModal, isOpen: false })}
          category={settingsModal.category}
          label={settingsModal.label}
        />
      </div>
    </div>
  );
}

