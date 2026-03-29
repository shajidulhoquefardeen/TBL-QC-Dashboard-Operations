import { useAppContext } from '../store';

export function DashboardPreview() {
  const { sugarData, concData, dfData, plantMetrics } = useAppContext();

  const latestSugar = sugarData && sugarData.length > 0 ? sugarData[sugarData.length - 1] : null;
  const latestConc = concData && concData.length > 0 ? concData[concData.length - 1] : null;
  const latestDf = dfData && dfData.length > 0 ? dfData[dfData.length - 1] : null;

  const MetricCard = ({ title, value, unit, color }: { title: string, value: string | number, unit: string, color: string }) => (
    <div className="bg-navy-card border border-border rounded-xl p-3 flex flex-col gap-1 transition-all hover:translate-y-[-2px]">
      <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider">{title}</div>
      <div className={`text-2xl font-condensed font-black ${color}`}>
        {value}<span className="text-[10px] ml-1 opacity-70 font-sans font-normal">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 border-l border-border bg-navy/20 w-80 shrink-0 hidden xl:flex flex-col gap-4 overflow-y-auto">
      <div className="font-condensed font-bold text-[12px] tracking-[2px] uppercase text-text-muted mb-2 flex items-center gap-2">
        📊 Dashboard Preview
      </div>

      <div className="space-y-3">
        <MetricCard 
          title="Latest Sugar Yield" 
          value={latestSugar?.ftd || '—'} 
          unit="%" 
          color="text-amber" 
        />
        <MetricCard 
          title="Latest Conc. Yield" 
          value={latestConc?.ftd || '—'} 
          unit="%" 
          color="text-accent" 
        />
        <MetricCard 
          title="DF Consumption" 
          value={latestDf?.ftd || '—'} 
          unit="L/Case" 
          color="text-teal" 
        />
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-3">Plant Capability</div>
        <div className="grid grid-cols-2 gap-2">
          {['Micro', 'Analytical', 'Sensory'].map(key => {
            const val = (plantMetrics as any)?.[`cap${key}`] || 'Green';
            const color = val === 'Green' ? 'bg-green' : val === 'Yellow' ? 'bg-amber' : val === 'Red' ? 'bg-red' : 'bg-accent';
            return (
              <div key={key} className="flex items-center gap-2 bg-navy-card border border-border rounded p-2">
                <div className={`w-2 h-2 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                <div className="text-[9px] font-bold text-text uppercase">{key}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-3">BSTI Status</div>
        <div className="space-y-2">
          {(plantMetrics?.bstiList || []).slice(0, 3).map((cert, i) => {
            const isExpired = cert.dueDate ? new Date() > new Date(cert.dueDate) : false;
            return (
              <div key={i} className="bg-navy-card border border-border rounded p-2 flex justify-between items-center">
                <div className="text-[9px] font-medium text-text truncate max-w-[120px]">{cert.name}</div>
                <div className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${isExpired ? 'bg-red/20 text-red' : 'bg-green/20 text-green'}`}>
                  {isExpired ? 'Exp' : 'OK'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1">Pro Tip</div>
        <div className="text-[9px] text-text-muted leading-relaxed">
          Data entered here updates the main dashboards in real-time. Ensure accuracy before saving.
        </div>
      </div>
    </div>
  );
}
