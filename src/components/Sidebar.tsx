import { useAppContext } from '../store';
import { PAGE } from '../constants';

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, setSidebarCollapsed } = useAppContext();

  const navItem = (id: string, icon: string, label: string) => {
    const isActive = currentView === id;
    return (
      <div 
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-[11px] border-l-2 transition-all ${isActive ? 'bg-accent/10 text-accent border-accent font-medium' : 'border-transparent text-text-muted hover:bg-white/5 hover:text-text font-normal'} ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
        onClick={() => setCurrentView(id)}
        title={sidebarCollapsed ? label : ''}
      >
        <span className={`text-[16px] flex-shrink-0 transition-transform duration-300 ${sidebarCollapsed ? 'scale-110' : ''}`}>{icon}</span>
        <span className={`truncate transition-all duration-300 origin-left ${sidebarCollapsed ? 'opacity-0 w-0 scale-x-0' : 'opacity-100 w-auto scale-x-100'}`}>
          {label}
        </span>
      </div>
    );
  };

  const navSection = (title: string) => (
    <div className={`px-4 uppercase font-semibold text-text-dim transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'opacity-0 h-0 py-0' : 'opacity-100 h-auto pt-4 pb-1 text-[8px] tracking-[1.5px]'}`}>
      {title}
    </div>
  );

  return (
    <aside 
      onMouseEnter={() => setSidebarCollapsed(false)}
      onMouseLeave={() => setSidebarCollapsed(true)}
      className={`${sidebarCollapsed ? 'w-[54px]' : 'w-[205px]'} fixed lg:relative inset-y-0 left-0 flex flex-col z-[120] flex-shrink-0 bg-navy-mid border-r border-border transition-all duration-300 ease-in-out overflow-hidden shadow-2xl lg:shadow-none group`}
    >
      <div className={`pt-3.5 pb-2.5 border-b border-border transition-all duration-300 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-condensed font-extrabold text-[11px] text-white bg-pepsi flex-shrink-0 shadow-lg">TBL</div>
          <div className={`truncate transition-all duration-300 origin-left ${sidebarCollapsed ? 'opacity-0 w-0 scale-x-0' : 'opacity-100 w-auto scale-x-100'}`}>
            <div className="font-condensed font-bold text-xs leading-[1.3] text-text truncate">TRANSCOM BEVERAGES</div>
            <div className="text-[8px] text-text-muted truncate">Ltd. · PepsiCo Franchise</div>
          </div>
        </div>
        <div className={`mt-2 px-2 py-0.5 rounded text-[8px] tracking-[1px] uppercase text-center bg-accent/10 border border-accent/20 text-accent truncate transition-all duration-300 origin-top ${sidebarCollapsed ? 'opacity-0 h-0 mt-0 py-0 border-0 scale-y-0' : 'opacity-100 h-auto scale-y-100'}`}>
          🏭 Chittagong Plant
        </div>
      </div>
      
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navSection('General')}
        {navItem('home', '🏠', 'QC Department')}

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

      <div className={`py-3 border-t border-border text-[9px] text-text-dim truncate transition-all duration-300 ${sidebarCollapsed ? 'text-center px-0' : 'px-4'}`}>
        {!sidebarCollapsed && <span>QC System v3.0 | </span>}
        <span className="font-bold">TBL</span>
      </div>
    </aside>
  );
}
