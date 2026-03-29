import React, { useState } from 'react';
import { useAppContext } from '../store';

export function Settings() {
  const { clearAll, loadSampleData, importCSV, role, showToast } = useAppContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);

  const isSuperAdmin = role === 'superadmin';

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSuperAdmin) {
      showToast('Only Super Admin can import data', 'error');
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          try {
            const lines = text.split(/\r?\n/);
            if (lines.length < 2) {
              showToast('CSV file is empty or missing data', 'error');
              return;
            }

            const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            // Normalize headers to match Run interface (camelCase)
            const headers = rawHeaders.map(h => {
              const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (lower === 'id') return 'id';
              if (lower === 'date') return 'date';
              if (lower === 'shift') return 'shift';
              if (lower === 'line') return 'line';
              if (lower === 'batchno' || lower === 'batch_no') return 'batchNo';
              if (lower === 'flavour' || lower === 'flavor') return 'flavour';
              if (lower === 'sku') return 'sku';
              if (lower === 'chemiststartup' || lower === 'chemist_startup') return 'chemistStartup';
              if (lower === 'chemistendup' || lower === 'chemist_endup') return 'chemistEndup';
              if (lower === 'linesyrupvol' || lower === 'line_syrup_vol') return 'lineSyrupVol';
              if (lower === 'pmxamount' || lower === 'pmx_amount') return 'pmxAmount';
              if (lower === 'linefg' || lower === 'line_fg') return 'lineFG';
              if (lower === 'pmxfg' || lower === 'pmx_fg') return 'pmxFG';
              if (lower === 'starttime' || lower === 'start_time') return 'startTime';
              if (lower === 'endtime' || lower === 'end_time') return 'endTime';
              if (lower === 'enddate' || lower === 'end_date') return 'endDate';
              if (lower === 'tpc') return 'tpc';
              if (lower === 'yeast') return 'yeast';
              if (lower === 'mold') return 'mold';
              if (lower === 'coliform') return 'coliform';
              if (lower === 'microdate' || lower === 'micro_date') return 'microDate';
              if (lower === 'microresult' || lower === 'micro_result') return 'microResult';
              if (lower === 'deviation') return 'deviation';
              if (lower === 'remarks') return 'remarks';
              return h; // Fallback
            });

            const importedRuns = [];
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              
              // Robust CSV splitting (handles quotes)
              const values: string[] = [];
              let current = '';
              let inQuotes = false;
              for (let charIdx = 0; charIdx < line.length; charIdx++) {
                const char = line[charIdx];
                if (char === '"') inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) {
                  values.push(current.trim());
                  current = '';
                } else current += char;
              }
              values.push(current.trim());

              const run: any = {};
              headers.forEach((h, idx) => {
                if (idx < values.length) {
                  run[h] = values[idx].replace(/"/g, '');
                }
              });

              // Basic validation/conversion
              if (run.id && run.date) {
                // Normalize date to YYYY-MM-DD if possible
                try {
                  const d = new Date(run.date);
                  if (!isNaN(d.getTime())) {
                    run.date = d.toISOString().split('T')[0];
                  }
                } catch (e) {
                  console.warn('Date normalization failed for', run.date);
                }

                run.sku = Number(run.sku) || 0;
                run.lineSyrupVol = Number(run.lineSyrupVol) || 0;
                run.pmxAmount = Number(run.pmxAmount) || 0;
                run.lineFG = Number(run.lineFG) || 0;
                run.pmxFG = Number(run.pmxFG) || 0;
                
                // Ensure required fields have defaults if missing
                run.shift = run.shift || 'Day';
                run.line = run.line || 'Line 1';
                run.flavour = run.flavour || 'Pepsi';
                run.batchNo = run.batchNo || `B-${Date.now()}`;
                run.chemistStartup = run.chemistStartup || 'Unknown';
                run.chemistEndup = run.chemistEndup || 'Unknown';
                run.startTime = run.startTime || '07:00';
                run.endTime = run.endTime || '15:00';
                run.endDate = run.endDate || run.date;
                run.coliform = run.coliform || 'Absent';
                run.microResult = run.microResult || 'Pending';
                run.deviation = run.deviation || 'None';
                run.remarks = run.remarks || '';
                run.createdAt = run.createdAt || new Date().toISOString();
                run.updatedAt = new Date().toISOString();

                // Final check for firestore rules compatibility
                if (run.sku <= 0) run.sku = 1; // Rules require > 0

                importedRuns.push(run);
              }
            }
            console.log('Parsed imported runs:', importedRuns);
            if (importedRuns.length > 0) {
              importCSV(importedRuns);
            } else {
              showToast('No valid runs found in CSV. Check "id" and "date" columns.', 'error');
            }
          } catch (err) {
            console.error('Error parsing CSV', err);
            showToast('Error parsing CSV file', 'error');
          }
        }
      };
      reader.readAsText(file);
      // Reset input so same file can be selected again
      e.target.value = '';
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
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-condensed font-semibold text-lg">Import CSV Data</div>
                    <div className="text-[10px] text-text-muted">Import production runs from a CSV file. The CSV must have headers matching the internal data structure.</div>
                  </div>
                  <button 
                    onClick={() => {
                      const headers = "id,date,shift,line,batchNo,flavour,sku,chemistStartup,chemistEndup,lineSyrupVol,pmxAmount,lineFG,pmxFG,startTime,endTime,endDate,tpc,yeast,mold,coliform,microDate,microResult,deviation,remarks";
                      const sample = "run_123,2026-03-29,Day,Line 1,B12345,Pepsi,250,Shajidul,Hoque,1000,500,4000,2000,07:00,15:00,2026-03-29,0,0,0,Absent,2026-03-29,Pass,None,Sample Import";
                      const blob = new Blob([`${headers}\n${sample}`], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'production_runs_template.csv';
                      a.click();
                    }}
                    className="bg-accent/10 border border-accent/30 text-accent rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider hover:bg-accent hover:text-white transition-all"
                  >
                    📥 Download Template
                  </button>
                </div>
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
            <span className="text-accent font-semibold tracking-wide">Developed by Shajidul Hoque</span>
          </div>
        </div>
      </div>
    </div>
  );
}
