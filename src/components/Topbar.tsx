import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../store';
import { PAGE } from '../constants';
import { calcYield, getStatus, today } from '../utils';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function Topbar() {
  const { currentView, openModal, runs, logOut, role, theme, setTheme } = useAppContext();
  const [time, setTime] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(
        n.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) +
        '  ' + n.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportCSV = () => {
    if(!runs.length){ alert('No records'); return;}
    const H=['Date','Batch','Line','Shift','ChemistStartup','ChemistEndup','Flavour','SKU','LineSyrupVol','PMXAmount','PMXVol','TotalSyrupVol','LineFG','PMXFG','TotalFG','Yield%','TPC','Yeast','Mold','Coliform','MicroResult','MicroDate','Remarks','Status'];
    const rows=runs.map(r=>{
      const y=calcYield(r); const st=getStatus(r).code;
      return [r.date,r.batchNo,r.line,r.shift,r.chemistStartup,r.chemistEndup||'',r.flavour,r.sku,
        r.lineSyrupVol||0,r.pmxAmount||0,y.pmxVol.toFixed(1),y.totalSyr.toFixed(1),
        r.lineFG||0,r.pmxFG||0,y.totalFG,y.yieldPct.toFixed(2),
        r.tpc??'',r.yeast??'',r.mold??'',r.coliform||'',r.microResult||'',r.microDate||'',r.remarks||'',st
      ].map(v=>'"'+(v??'')+'"');
    });
    const csv=[H.join(','),...rows.map(r=>r.join(','))].join('\n');
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download=`TBL_QC_${today()}.csv`; a.click();
    setShowExportMenu(false);
  };

  const exportDashboard = async (id: string, format: 'png' | 'pdf', fileName: string) => {
    const element = document.getElementById(id);
    if (!element) {
      alert(`Please open the ${fileName} first to export it.`);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0e17',
        scale: 2,
        logging: false,
        useCORS: true
      });

      if (format === 'png') {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${fileName}_${today()}.png`;
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'l' : 'p',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}_${today()}.pdf`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
    setShowExportMenu(false);
  };

  return (
    <div className="sticky top-0 z-50 backdrop-blur-md flex items-center justify-between px-5 py-2.5 bg-navy/95 border-b border-border">
      <div>
        <div className="font-condensed font-bold text-lg tracking-[1px] text-text">{PAGE[currentView]?.t || 'Dashboard'}</div>
        <div className="text-[9px] text-text-muted">{PAGE[currentView]?.s || ''}</div>
      </div>
      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-full border border-border text-text-muted hover:text-accent transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="flex items-center gap-1.5 text-[9px] text-green">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green"></div> Live
        </div>
        <div className="border border-border bg-navy-card px-2.5 py-1 rounded text-[10px] font-mono text-text-muted">{time || '—'}</div>
        {role && (
          <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
            role === 'superadmin' ? 'bg-amber/20 text-amber' : 
            role === 'admin' ? 'bg-accent/20 text-accent' : 
            'bg-green/20 text-green'
          }`}>
            {role}
          </div>
        )}
        
        <div className="relative" ref={menuRef}>
          <button 
            className="bg-transparent rounded px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all hover:border-accent hover:text-accent flex items-center gap-1.5 border border-border text-text-muted"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            ⬇ Export <span className="text-[8px]">▼</span>
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-1.5 w-56 border border-border bg-navy-card rounded-lg shadow-2xl z-[60] py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest mb-1 text-text-dim border-b border-border/50">Export Options</div>
              
              <button onClick={exportCSV} className="w-full text-left px-3 py-2 text-[11px] text-text hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2">
                <span className="text-green">📄</span> Download CSV File
              </button>
              
              <div className="h-px my-1 bg-border/50"></div>
              
              <button onClick={() => exportDashboard('qc-dashboard', 'pdf', 'QC_Dashboard')} className="w-full text-left px-3 py-2 text-[11px] text-text hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2">
                <span className="text-red">📕</span> Download QC Dashboard (PDF)
              </button>
              
              <button onClick={() => exportDashboard('qc-dashboard', 'png', 'QC_Dashboard')} className="w-full text-left px-3 py-2 text-[11px] text-text hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2">
                <span className="text-pepsi">🖼️</span> Download QC Dashboard (Image)
              </button>
              
              <div className="h-px my-1 bg-border/50"></div>
              
              <button onClick={() => exportDashboard('yield-dashboard', 'pdf', 'Yield_Dashboard')} className="w-full text-left px-3 py-2 text-[11px] text-text hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2">
                <span className="text-amber">📙</span> Download Yield Dashboard (PDF)
              </button>
              
              <button onClick={() => exportDashboard('yield-dashboard', 'png', 'Yield_Dashboard')} className="w-full text-left px-3 py-2 text-[11px] text-text hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2">
                <span className="text-purple-500">🖼️</span> Download Yield Dashboard (Image)
              </button>
            </div>
          )}
        </div>

        <button className="border-none text-white rounded px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all hover:bg-pepsi/80 bg-pepsi" onClick={() => openModal()}>+ New Entry</button>
        <button className="bg-transparent rounded px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all hover:bg-red/10 border border-red/30 text-red" onClick={logOut}>Log Out</button>
      </div>
    </div>
  );
}
