import { useAppContext } from '../store';
import { User, Quote, GraduationCap } from 'lucide-react';

export function TeamPreview() {
  const { teamMembers, legacyMembers, managerQuotes } = useAppContext();

  const plantManager = managerQuotes.find(q => q.id === 'plant_manager');
  const qcManager = managerQuotes.find(q => q.id === 'qc_manager');

  return (
    <div className="p-6 border-l border-border bg-navy/20 w-80 shrink-0 hidden xl:flex flex-col gap-6 overflow-y-auto">
      <div className="font-condensed font-bold text-[12px] tracking-[2px] uppercase text-accent mb-2 flex items-center gap-2">
        👀 Landing Page Preview
      </div>

      {/* Managers Preview */}
      <div className="space-y-4">
        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-border pb-1">Leadership</div>
        
        {[plantManager, qcManager].map((m, i) => (
          <div key={i} className="bg-navy-card border border-border rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-navy border border-border overflow-hidden shrink-0">
                {m?.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-text-muted m-2" />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-text truncate">{m?.name || (i === 0 ? 'Plant Manager' : 'QC Manager')}</div>
                <div className="text-[8px] text-accent uppercase tracking-tighter">{i === 0 ? 'Plant Manager' : 'QC Manager'}</div>
              </div>
            </div>
            <div className="relative">
              <Quote className="absolute -top-1 -left-1 w-3 h-3 text-accent/20" />
              <p className="text-[9px] text-text-muted italic line-clamp-3 pl-3">
                {m?.quote || 'No quote added yet...'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Team Preview */}
      <div className="space-y-3">
        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-border pb-1">Current Team ({teamMembers.length})</div>
        <div className="grid grid-cols-4 gap-2">
          {teamMembers.slice(0, 8).map(m => (
            <div key={m.id} className="group relative">
              <div className="aspect-square rounded-lg bg-navy-card border border-border overflow-hidden">
                {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-text-muted opacity-30" />}
              </div>
              <div className="absolute inset-0 bg-accent/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <span className="text-[8px] font-bold text-navy text-center px-1 truncate">{m.name.split(' ')[0]}</span>
              </div>
            </div>
          ))}
          {teamMembers.length > 8 && (
            <div className="aspect-square rounded-lg bg-navy-card border border-border flex items-center justify-center text-[10px] text-text-muted font-bold">
              +{teamMembers.length - 8}
            </div>
          )}
        </div>
      </div>

      {/* Legacy Preview */}
      <div className="space-y-3">
        <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider border-b border-border pb-1">Legacy ({legacyMembers.length})</div>
        <div className="space-y-2">
          {legacyMembers.slice(0, 3).map(m => (
            <div key={m.id} className="flex items-center gap-2 bg-navy-card border border-border rounded p-2">
              <div className="w-6 h-6 rounded-full bg-navy border border-border overflow-hidden shrink-0">
                {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <GraduationCap className="w-3 h-3 text-text-muted m-1.5 opacity-40" />}
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-bold text-text truncate">{m.name}</div>
                <div className="text-[8px] text-text-dim truncate">{m.tenure}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1">Live Sync</div>
        <div className="text-[9px] text-text-muted leading-relaxed">
          This preview shows how your team will appear on the public landing page.
        </div>
      </div>
    </div>
  );
}
