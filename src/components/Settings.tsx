import React, { useState } from 'react';
import { useAppContext } from '../store';

export function Settings() {
  const { clearAll, loadSampleData, importCSV, role } = useAppContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);

  const isSuperAdmin = role === 'superadmin';

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSuperAdmin) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          try {
            const lines = text.split('\n');
            if (lines.length < 2) return;
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const importedRuns = [];
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              const run: any = {};
              headers.forEach((h, idx) => {
                run[h] = values[idx];
              });
              // Basic validation/conversion
              if (run.id && run.date) {
                run.sku = Number(run.sku) || 0;
                run.lineSyrupVol = Number(run.lineSyrupVol) || 0;
                run.pmxAmount = Number(run.pmxAmount) || 0;
                run.lineFG = Number(run.lineFG) || 0;
                run.pmxFG = Number(run.pmxFG) || 0;
                importedRuns.push(run);
              }
            }
            if (importedRuns.length > 0) {
              importCSV(importedRuns);
            } else {
              alert('No valid runs found in CSV.');
            }
          } catch (err) {
            console.error('Error parsing CSV', err);
            alert('Error parsing CSV file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-[18px_22px]">
      <div className="bg-navy-card border border-border rounded-lg p-3.5 mb-4">
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-text-muted mb-3.5 pb-2 border-b border-border">⚙️ System Settings & Data Management</div>
        
        {!isSuperAdmin ? (
          <div className="bg-navy border border-border rounded-md p-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <div className="font-condensed font-bold text-lg text-text mb-2 uppercase tracking-widest">Restricted Access</div>
            <div className="text-[11px] text-text-muted max-w-xs mx-auto">Data management actions (Import, Clear, Load Samples) are restricted to Super Admin accounts only.</div>
          </div>
        ) : (
          <>
            <div className="bg-amber/5 border border-amber/20 rounded-md p-[10px_12px] text-[10px] text-text-muted mb-4">
              <strong className="text-amber">Warning:</strong> These actions directly affect the cloud database. Please proceed with caution.
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy border border-border rounded-lg p-4 flex flex-col gap-3">
                <div className="font-condensed font-semibold text-lg">Load Sample Data</div>
                <div className="text-[10px] text-text-muted">Populate the database with a set of realistic sample production runs to test the dashboard features.</div>
                
                {showLoadConfirm ? (
                  <div className="mt-auto flex gap-2 items-center bg-navy-card p-2 rounded border border-border">
                    <span className="text-[10px] text-text">Are you sure?</span>
                    <button className="bg-accent text-white rounded px-2 py-1 text-[10px] font-semibold hover:bg-accent/80" onClick={() => { loadSampleData(); setShowLoadConfirm(false); }}>Yes, Load</button>
                    <button className="bg-transparent border border-border text-text-muted rounded px-2 py-1 text-[10px] hover:text-text" onClick={() => setShowLoadConfirm(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="border-none bg-accent text-white rounded px-3 py-2 text-[11px] font-semibold cursor-pointer transition-all hover:bg-accent/80 self-start mt-auto" onClick={() => setShowLoadConfirm(true)}>Load Samples</button>
                )}
              </div>

              <div className="bg-navy border border-border rounded-lg p-4 flex flex-col gap-3">
                <div className="font-condensed font-semibold text-lg text-red">Clear All Data</div>
                <div className="text-[10px] text-text-muted">Permanently delete all production runs, sugar data, and concentrate data from the database. This action cannot be undone.</div>
                
                {showClearConfirm ? (
                  <div className="mt-auto flex gap-2 items-center bg-red/10 p-2 rounded border border-red/30">
                    <span className="text-[10px] text-red font-bold">Are you sure?</span>
                    <button className="bg-red text-white rounded px-2 py-1 text-[10px] font-semibold hover:bg-red/80" onClick={() => { clearAll(); setShowClearConfirm(false); }}>Yes, Delete All</button>
                    <button className="bg-transparent border border-border text-text-muted rounded px-2 py-1 text-[10px] hover:text-text" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="border border-red bg-red/10 text-red rounded px-3 py-2 text-[11px] font-semibold cursor-pointer transition-all hover:bg-red hover:text-white self-start mt-auto" onClick={() => setShowClearConfirm(true)}>Clear Database</button>
                )}
              </div>

              <div className="bg-navy border border-border rounded-lg p-4 flex flex-col gap-3 col-span-2">
                <div className="font-condensed font-semibold text-lg">Import CSV Data</div>
                <div className="text-[10px] text-text-muted">Import production runs from a CSV file. The CSV must have headers matching the internal data structure (e.g., date, line, batchNo, flavour, etc.).</div>
                <div className="flex items-center gap-3 mt-auto">
                  <input type="file" accept=".csv" className="text-[10px] text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 cursor-pointer" onChange={handleImport} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-navy-card border border-border rounded-lg p-3.5 mb-4">
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-text-muted mb-3.5 pb-2 border-b border-border">🧪 Formula Reference Guide</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-navy border border-border rounded-lg p-3">
            <div className="font-condensed font-semibold text-[11px] text-accent uppercase tracking-wider mb-2">Concentrate Yield</div>
            <div className="text-[10px] font-mono bg-black/20 p-2 rounded border border-border/50 text-teal mb-2">
              (Actual Syrup / Standard Syrup) × 100
            </div>
            <div className="text-[9px] text-text-muted leading-relaxed">
              Measures the efficiency of concentrate usage during syrup preparation. Target: 100% ± 0.5%
            </div>
          </div>
          
          <div className="bg-navy border border-border rounded-lg p-3">
            <div className="font-condensed font-semibold text-[11px] text-amber uppercase tracking-wider mb-2">Sugar Yield</div>
            <div className="text-[10px] font-mono bg-black/20 p-2 rounded border border-border/50 text-amber mb-2">
              (Actual Sugar / Standard Sugar) × 100
            </div>
            <div className="text-[9px] text-text-muted leading-relaxed">
              Calculates sugar utilization efficiency against theoretical requirements. Target: 100% ± 0.3%
            </div>
          </div>

          <div className="bg-navy border border-border rounded-lg p-3">
            <div className="font-condensed font-semibold text-[11px] text-green uppercase tracking-wider mb-2">Line Yield</div>
            <div className="text-[10px] font-mono bg-black/20 p-2 rounded border border-border/50 text-green mb-2">
              (Actual FG / Standard FG) × 100
            </div>
            <div className="text-[9px] text-text-muted leading-relaxed">
              Overall production efficiency comparing finished goods output to input syrup. Target: &gt; 99.5%
            </div>
          </div>
        </div>
      </div>

      <div className="bg-navy-card border border-border rounded-lg p-3.5">
        <div className="font-condensed font-bold text-[13px] tracking-[1.5px] uppercase text-text-muted mb-3.5 pb-2 border-b border-border">ℹ️ Application Info</div>
        <div className="text-[10px] text-text-muted flex flex-col gap-2">
          <div><strong>Version:</strong> 1.0.0-production</div>
          <div><strong>Environment:</strong> Cloud Firestore</div>
          <div><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</div>
          <div className="mt-2 pt-2 border-t border-border flex justify-between items-center">
            <span>Developed for Quality Control & Production Monitoring.</span>
            <span className="text-accent font-semibold tracking-wide">Developed by Sajid Fardeen</span>
          </div>
        </div>
      </div>
    </div>
  );
}
