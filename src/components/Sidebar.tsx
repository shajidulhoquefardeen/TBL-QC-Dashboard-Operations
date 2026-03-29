import { useAppContext } from '../store';
import { PAGE } from '../constants';

export function Sidebar() {
  const { currentView, setCurrentView } = useAppContext();

  const navItem = (id: string, icon: string, label: string) => {
    const isActive = currentView === id;
    return (
      <div 
        className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-[11px] border-l-2 transition-all ${isActive ? 'bg-accent/10 text-accent border-accent font-medium' : 'border-transparent text-text-muted hover:bg-white/5 hover:text-text font-normal'}`}
        onClick={() => setCurrentView(id)}
      >
        <span className="text-[13px] w-4 text-center">{icon}</span> {label}
      </div>
    );
  };

  const navSection = (title: string) => (
    <div className="px-4 pt-2 pb-1 text-[8px] tracking-[1.5px] uppercase font-semibold text-text-dim">
      {title}
    </div>
  );

  return (
    <aside className="w-[205px] flex flex-col z-[100] flex-shrink-0 bg-navy-mid border-r border-border">
      <div className="px-4 pt-3.5 pb-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-condensed font-extrabold text-[11px] text-white bg-pepsi">TBL</div>
          <div>
            <div className="font-condensed font-bold text-xs leading-[1.3] text-text">TRANSCOM BEVERAGES</div>
            <div className="text-[8px] text-text-muted">Ltd. · PepsiCo Franchise</div>
          </div>
        </div>
        <div className="mt-2 mx-4 px-2 py-0.5 rounded text-[8px] tracking-[1px] uppercase text-center bg-accent/10 border border-accent/20 text-accent">🏭 Chittagong Plant</div>
      </div>
      <nav className="flex-1 py-2.5 overflow-y-auto">
        {navSection('Dashboards')}
        {navItem('qc', '📊', 'QC Dashboard')}
        {navItem('yield', '🏆', 'Yield Dashboard')}
        {navSection('Data Entry')}
        {navItem('dataEntry', '🧪', 'Data Entry')}
        {navSection('Operations')}
        {navItem('lineboard', '🏭', 'Line Board')}
        {navItem('records', '📋', 'Records')}
        {navSection('Performance')}
        {navItem('chemist', '👤', 'Chemist Performance')}
        {navItem('line', '📈', 'Line Performance')}
        {navSection('Compliance')}
        {navItem('certs', '📜', 'Certifications')}
        {navSection('System')}
        {navItem('settings', '⚙️', 'Settings')}
      </nav>
      <div className="px-4 py-2.5 border-t border-border text-[9px] text-text-dim">
        QC System v3.0 &nbsp;|&nbsp; TBL-CGP
      </div>
    </aside>
  );
}
