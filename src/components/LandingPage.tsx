import { useAppContext } from '../store';
import { User, Quote as QuoteIcon, GraduationCap, Award } from 'lucide-react';

export function LandingPage() {
  const { teamMembers, legacyMembers, managerQuotes, achievementCards, landingConfig, customSettings } = useAppContext();

  const plantManager = managerQuotes.find(q => q.id === 'plant_manager') || { 
    name: 'Plant Manager', 
    quote: "Quality is not an act, it is a habit. At our Chittagong Plant, we don't just produce beverages; we produce trust. The QC team is the backbone of our operational excellence, ensuring that every drop represents the Transcom legacy of quality.",
    photoUrl: ''
  };
  
  const qcManager = managerQuotes.find(q => q.id === 'qc_manager') || { 
    name: 'QC Manager', 
    quote: "Our laboratory is where science meets passion. We are committed to continuous improvement and technological advancement in our testing methods. Every member of this team is a specialist dedicated to the perfection of our products.",
    photoUrl: ''
  };

  const heroBg = customSettings.landingBgUrl || "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&q=80&w=1920";

  const mission = landingConfig || {
    missionTitle: 'Our Mission',
    missionText: 'The Quality Control Department at Transcom Beverages Ltd., Chittagong Plant, is dedicated to ensuring that every bottle of PepsiCo products meets the highest global standards of quality and safety.',
    missionTextSecondary: 'Our state-of-the-art laboratory and rigorous testing protocols cover every stage of production—from raw materials and water treatment to the final finished product. We are the guardians of the brand\'s promise to our consumers.'
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[500px] overflow-hidden">
        <img 
          src={heroBg} 
          alt="Pepsi Production & Quality Control" 
          className="w-full h-full object-cover opacity-40"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-condensed font-bold text-5xl md:text-7xl text-text tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            QUALITY CONTROL DEPARTMENT
          </h1>
          <p className="text-accent font-medium tracking-[4px] uppercase text-sm md:text-base animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Transcom Beverages Ltd. | Chittagong Plant
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-condensed font-bold text-3xl text-text mb-6 border-l-4 border-pepsi pl-4 uppercase tracking-tight">{mission.missionTitle}</h2>
          <p className="text-text-muted leading-relaxed mb-6 whitespace-pre-wrap">
            {mission.missionText}
          </p>
          {mission.missionTextSecondary && (
            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
              {mission.missionTextSecondary}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {achievementCards.length > 0 ? (
            achievementCards.map(card => (
              <div key={card.id} className="bg-navy-card p-6 rounded-xl border border-border text-center flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-12 h-12 mb-3 flex items-center justify-center">
                  {card.logoUrl ? (
                    <img src={card.logoUrl} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Award className="text-accent/20 w-8 h-8" />
                  )}
                </div>
                <div className="text-text font-bold text-xl leading-tight">{card.boldText}</div>
                <div className="text-text-dim text-[10px] uppercase tracking-wider mt-1">{card.subText}</div>
              </div>
            ))
          ) : (
            <>
              <div className="bg-navy-card p-6 rounded-xl border border-border text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-text font-bold text-xl">950+</div>
                <div className="text-text-dim text-[10px] uppercase tracking-wider">AIB Score</div>
              </div>
              <div className="bg-navy-card p-6 rounded-xl border border-border text-center">
                <div className="text-3xl mb-2">🧪</div>
                <div className="text-text font-bold text-xl">100%</div>
                <div className="text-text-dim text-[10px] uppercase tracking-wider">Compliance</div>
              </div>
              <div className="bg-navy-card p-6 rounded-xl border border-border text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <div className="text-text font-bold text-xl">FSSC</div>
                <div className="text-text-dim text-[10px] uppercase tracking-wider">Certified</div>
              </div>
              <div className="bg-navy-card p-6 rounded-xl border border-border text-center">
                <div className="text-3xl mb-2">✨</div>
                <div className="text-text font-bold text-xl">Zero</div>
                <div className="text-text-dim text-[10px] uppercase tracking-wider">Defects</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Manager Messages */}
      <div className="bg-navy-mid py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Plant Manager */}
          <div className="bg-navy-card p-8 rounded-2xl border border-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pepsi/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-pepsi/20 flex items-center justify-center overflow-hidden border border-pepsi/30">
                {plantManager.photoUrl ? <img src={plantManager.photoUrl} className="w-full h-full object-cover" /> : <User className="text-pepsi w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-text font-bold text-lg">{plantManager.name || 'Plant Manager'}</h3>
                <p className="text-accent text-xs uppercase tracking-wider">Plant Manager | TBL</p>
              </div>
            </div>
            <div className="relative">
              <QuoteIcon className="absolute -top-2 -left-2 w-8 h-8 text-pepsi/10 -z-0" />
              <p className="text-text-muted italic leading-relaxed relative z-10 pl-4">
                "{plantManager.quote}"
              </p>
            </div>
          </div>

          {/* QC Manager */}
          <div className="bg-navy-card p-8 rounded-2xl border border-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-accent/30">
                {qcManager.photoUrl ? <img src={qcManager.photoUrl} className="w-full h-full object-cover" /> : <User className="text-accent w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-text font-bold text-lg">{qcManager.name || 'QC Manager'}</h3>
                <p className="text-accent text-xs uppercase tracking-wider">QC Manager | TBL</p>
              </div>
            </div>
            <div className="relative">
              <QuoteIcon className="absolute -top-2 -left-2 w-8 h-8 text-accent/10 -z-0" />
              <p className="text-text-muted italic leading-relaxed relative z-10 pl-4">
                "{qcManager.quote}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-condensed font-bold text-4xl text-text mb-4 uppercase tracking-tighter">THE QC TEAM</h2>
          <div className="w-20 h-1 bg-pepsi mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-20">
          {teamMembers.map((m) => (
            <div key={m.id} className="bg-navy-card p-6 rounded-xl border border-border text-center hover:border-accent transition-all group hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-navy mx-auto mb-4 flex items-center justify-center overflow-hidden border border-border group-hover:border-accent/50 transition-colors">
                {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <User className="text-text-muted w-8 h-8" />}
              </div>
              <h4 className="text-text font-bold text-sm mb-1">{m.name}</h4>
              <p className="text-text-dim text-[10px] uppercase tracking-wider">{m.designation}</p>
            </div>
          ))}
        </div>

        {/* Legacy Members */}
        {legacyMembers.length > 0 && (
          <div className="mt-20">
            <h3 className="font-condensed font-bold text-2xl text-text mb-12 text-center opacity-60 italic uppercase tracking-widest">Legacy Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {legacyMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-4 bg-navy-mid/50 p-5 rounded-xl border border-border/30 hover:bg-navy-mid transition-colors">
                  <div className="w-12 h-12 rounded-full bg-navy-card flex items-center justify-center overflow-hidden border border-border shrink-0">
                    {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <GraduationCap className="text-text-muted w-6 h-6 opacity-40" />}
                  </div>
                  <div>
                    <h4 className="text-text-muted font-bold text-sm">{m.name}</h4>
                    <p className="text-text-dim text-[10px] uppercase tracking-tight">{m.designation} • {m.tenure}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-navy-mid border-t border-border py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-pepsi flex items-center justify-center font-condensed font-black text-white">TBL</div>
              <div>
                <div className="font-condensed font-bold text-lg text-text leading-none uppercase tracking-tight">TRANSCOM BEVERAGES</div>
                <div className="text-[10px] text-text-muted uppercase tracking-widest">Chittagong Plant</div>
              </div>
            </div>
            <p className="text-text-dim text-xs leading-relaxed max-w-md">
              Official Quality Control Management System. Designed for operational excellence and real-time quality monitoring of PepsiCo franchise operations in Bangladesh.
            </p>
          </div>
          
          <div>
            <h4 className="text-text font-bold text-xs uppercase tracking-widest mb-6">Quick Links</h4>
            <ul className="space-y-3 text-text-dim text-xs">
              <li className="hover:text-accent cursor-pointer transition-colors">QC Dashboard</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Yield Analytics</li>
              <li className="hover:text-accent cursor-pointer transition-colors">Compliance Records</li>
              <li className="hover:text-accent cursor-pointer transition-colors">System Settings</li>
            </ul>
          </div>

          <div>
            <h4 className="text-text font-bold text-xs uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-3 text-text-dim text-xs">
              <li>📍 Kalurghat I/A, Chittagong</li>
              <li>📧 qc.cgp@transcombd.com</li>
              <li>📞 +880 31 XXXXXXX</li>
              <li className="text-accent font-bold mt-4">#OneTeamOneDream</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-text-dim flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span>© {new Date().getFullYear()} Transcom Beverages Ltd. All rights reserved.</span>
            <span className="hidden md:inline text-border/30">|</span>
            <span className="text-accent/60 font-medium tracking-wide">Developed by Shajidul Hoque</span>
          </div>
          <div className="flex gap-6 text-[10px] text-text-dim uppercase tracking-widest">
            <span className="hover:text-text cursor-pointer">Privacy Policy</span>
            <span className="hover:text-text cursor-pointer">Terms of Service</span>
            <span className="hover:text-text cursor-pointer">PepsiCo Global</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
