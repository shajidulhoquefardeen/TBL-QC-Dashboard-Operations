import { useAppContext } from '../store';
import { PAGE } from '../constants';

export function Sidebar() {
  const { currentView, setCurrentView } = useAppContext();

  const navItem = (id: string, icon: string, label: string) => {
    const isActive = currentView === id;
    return (
      <div 
        className={`flex items-center gap-2 px-4 py-2 cursor-pointer text-[11px] border-l-2 transition-all ${isActive ? '' : 'hover:bg-white/5 hover:text-text'}`}
        style={{ 
          backgroundColor: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
          color: isActive ? '#00e5ff' : '#6a8fc0',
          borderColor: isActive ? '#00e5ff' : 'transparent',
          fontWeight: isActive ? 500 : 400
        }}
        onClick={() => setCurrentView(id)}
      >
        <span className="text-[13px] w-4 text-center">{icon}</span> {label}
      </div>
    );
  };

  const navSection = (title: string) => (
    <div className="px-4 pt-2 pb-1 text-[8px] tracking-[1.5px] uppercase font-semibold" style={{ color: '#3a5a8a' }}>
      {title}
    </div>
  );

  return (
    <aside className="w-[205px] flex flex-col z-[100] flex-shrink-0" style={{ backgroundColor: '#0f1f3d', borderRight: '1px solid #1a3060' }}>
      <div className="px-4 pt-3.5 pb-2.5 border-b" style={{ borderBottom: '1px solid #1a3060' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-condensed font-extrabold text-[11px] text-white" style={{ backgroundColor: '#1565c0' }}>TBL</div>
          <div>
            <div className="font-condensed font-bold text-xs leading-[1.3]">TRANSCOM BEVERAGES</div>
            <div className="text-[8px]" style={{ color: '#6a8fc0' }}>Ltd. · PepsiCo Franchise</div>
          </div>
        </div>
        <div className="mt-2 mx-4 px-2 py-0.5 rounded text-[8px] tracking-[1px] uppercase text-center" style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.15)', color: '#00e5ff' }}>🏭 Chittagong Plant</div>
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
      <div className="px-4 py-2.5 border-t text-[9px]" style={{ borderTop: '1px solid #1a3060', color: '#3a5a8a' }}>
        QC System v3.0 &nbsp;|&nbsp; TBL-CGP
      </div>
    </aside>
  );
}
