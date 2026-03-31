import { useState, ChangeEvent, useEffect } from 'react';
import { useAppContext } from '../store';
import { TeamMember, LegacyMember, ManagerQuote, AchievementCard, LandingPageConfig } from '../types';
import { User, Trash2, Plus, Quote, Users, History, Target, Award, Image as ImageIcon } from 'lucide-react';

export function LandingPageManagement() {
  const { 
    teamMembers, legacyMembers, managerQuotes, achievementCards, landingConfig,
    saveTeamMember, deleteTeamMember, saveLegacyMember, deleteLegacyMember, saveManagerQuote, 
    saveAchievementCard, deleteAchievementCard, saveLandingConfig,
    customSettings, savePlantConfig 
  } = useAppContext();
  
  const [newMember, setNewMember] = useState({ name: '', designation: '', photoUrl: '' });
  const [newLegacy, setNewLegacy] = useState({ name: '', designation: '', tenure: '', photoUrl: '' });
  const [newCard, setNewCard] = useState({ boldText: '', subText: '', logoUrl: '' });
  
  const plantManager = managerQuotes.find(q => q.id === 'plant_manager') || { id: 'plant_manager', name: '', quote: '', photoUrl: '' };
  const qcManager = managerQuotes.find(q => q.id === 'qc_manager') || { id: 'qc_manager', name: '', quote: '', photoUrl: '' };

  const [mission, setMission] = useState<LandingPageConfig>(landingConfig || { missionTitle: 'Our Mission', missionText: '', missionTextSecondary: '' });

  // Update local state when landingConfig changes (e.g. from initial load)
  useEffect(() => {
    if (landingConfig) {
      setMission(landingConfig);
    }
  }, [landingConfig]);

  const handleMissionChange = (field: keyof LandingPageConfig, value: string) => {
    setMission(prev => ({ ...prev, [field]: value }));
  };

  const handleMissionBlur = () => {
    saveLandingConfig(mission);
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>, callback: (base64: string) => void, maxDim = 400) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          callback(compressedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const [localTeamMembers, setLocalTeamMembers] = useState<TeamMember[]>(teamMembers);
  const [localLegacyMembers, setLocalLegacyMembers] = useState<LegacyMember[]>(legacyMembers);
  const [localAchievementCards, setLocalAchievementCards] = useState<AchievementCard[]>(achievementCards);
  const [localManagerQuotes, setLocalManagerQuotes] = useState<ManagerQuote[]>(managerQuotes);

  useEffect(() => {
    setLocalTeamMembers(teamMembers);
    setLocalLegacyMembers(legacyMembers);
    setLocalAchievementCards(achievementCards);
    setLocalManagerQuotes(managerQuotes);
  }, [teamMembers, legacyMembers, achievementCards, managerQuotes]);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.designation) return;
    const member = {
      id: crypto.randomUUID(),
      ...newMember,
      updatedAt: new Date().toISOString()
    };
    setLocalTeamMembers([...localTeamMembers, member]);
    saveTeamMember(member);
    setNewMember({ name: '', designation: '', photoUrl: '' });
  };

  const handleDeleteMember = (id: string) => {
    setLocalTeamMembers(localTeamMembers.filter(m => m.id !== id));
    deleteTeamMember(id);
  };

  const handleAddLegacy = () => {
    if (!newLegacy.name || !newLegacy.designation || !newLegacy.tenure) return;
    const legacy = {
      id: crypto.randomUUID(),
      ...newLegacy,
      updatedAt: new Date().toISOString()
    };
    setLocalLegacyMembers([...localLegacyMembers, legacy]);
    saveLegacyMember(legacy);
    setNewLegacy({ name: '', designation: '', tenure: '', photoUrl: '' });
  };

  const handleDeleteLegacy = (id: string) => {
    setLocalLegacyMembers(localLegacyMembers.filter(m => m.id !== id));
    deleteLegacyMember(id);
  };

  const handleAddCard = () => {
    if (!newCard.boldText || !newCard.subText) return;
    const card = {
      id: crypto.randomUUID(),
      ...newCard,
      updatedAt: new Date().toISOString()
    };
    setLocalAchievementCards([...localAchievementCards, card]);
    saveAchievementCard(card);
    setNewCard({ boldText: '', subText: '', logoUrl: '' });
  };

  const handleDeleteCard = (id: string) => {
    setLocalAchievementCards(localAchievementCards.filter(c => c.id !== id));
    deleteAchievementCard(id);
  };

  const handleManagerQuoteChange = (id: string, field: keyof ManagerQuote, value: string) => {
    const updatedQuotes = localManagerQuotes.map(q => q.id === id ? { ...q, [field]: value } : q);
    setLocalManagerQuotes(updatedQuotes);
  };

  const handleManagerQuoteBlur = (id: string) => {
    const quote = localManagerQuotes.find(q => q.id === id);
    if (quote) saveManagerQuote(quote);
  };

  return (
    <div className="p-8 space-y-12 max-w-5xl mx-auto">
      {/* Appearance Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <ImageIcon className="text-accent w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Landing Page Appearance</h2>
        </div>
        <div className="bg-navy-card p-6 rounded-xl border border-border flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Hero Background Image</h3>
            <p className="text-xs text-text-muted">Upload a high-quality image for the landing page hero section.</p>
            <input 
              type="file" 
              accept="image/*" 
              className="text-xs text-text-muted mt-4" 
              onChange={e => handlePhotoUpload(e, (base64) => savePlantConfig({ ...customSettings, landingBgUrl: base64 }), 1920)}
            />
          </div>
          <div className="w-full md:w-64 aspect-video rounded-lg bg-navy border border-border overflow-hidden relative group">
            {customSettings.landingBgUrl ? (
              <img src={customSettings.landingBgUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-text-muted uppercase tracking-widest text-center px-4">
                Default Background Active
              </div>
            )}
            {customSettings.landingBgUrl && (
              <button 
                onClick={() => {
                  const { landingBgUrl, ...rest } = customSettings;
                  savePlantConfig(rest);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Target className="text-accent w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Mission Statement</h2>
        </div>
        <div className="bg-navy-card p-6 rounded-xl border border-border space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-text-muted">Section Title</label>
            <input 
              type="text" 
              className="finp w-full" 
              value={mission.missionTitle || ''} 
              onChange={e => handleMissionChange('missionTitle', e.target.value)}
              onBlur={handleMissionBlur}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-text-muted">Primary Text</label>
            <textarea 
              className="finp w-full h-24 resize-none" 
              value={mission.missionText || ''} 
              onChange={e => handleMissionChange('missionText', e.target.value)}
              onBlur={handleMissionBlur}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-text-muted">Secondary Text (Optional)</label>
            <textarea 
              className="finp w-full h-24 resize-none" 
              value={mission.missionTextSecondary || ''} 
              onChange={e => handleMissionChange('missionTextSecondary', e.target.value)}
              onBlur={handleMissionBlur}
            />
          </div>
        </div>
      </section>

      {/* Achievement Cards Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Award className="text-accent w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Achievement Cards</h2>
        </div>
        <div className="bg-navy-card p-6 rounded-xl border border-border space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Bold Text (e.g. 950+)</label>
              <input type="text" className="finp w-full" value={newCard.boldText} onChange={e => setNewCard({...newCard, boldText: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Sub Text (e.g. AIB Score)</label>
              <input type="text" className="finp w-full" value={newCard.subText} onChange={e => setNewCard({...newCard, subText: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Logo/Icon</label>
              <div className="flex items-center gap-2">
                {newCard.logoUrl && <img src={newCard.logoUrl} className="w-8 h-8 object-contain border border-accent p-1 bg-navy" />}
                <input type="file" accept="image/*" className="text-[10px] text-text-muted w-full" onChange={e => handlePhotoUpload(e, (b) => setNewCard({...newCard, logoUrl: b}), 128)} />
              </div>
            </div>
            <button onClick={handleAddCard} className="bg-accent text-navy font-bold py-2 px-4 rounded hover:opacity-90 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Card
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localAchievementCards.map(card => (
              <div key={card.id} className="flex items-center gap-4 p-4 bg-navy-mid rounded-lg border border-border group relative">
                <div className="w-12 h-12 rounded bg-navy-card flex items-center justify-center overflow-hidden border border-border p-2">
                  {card.logoUrl ? <img src={card.logoUrl} className="w-full h-full object-contain" /> : <Award className="text-text-muted w-6 h-6 opacity-20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg text-text leading-tight">{card.boldText}</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider truncate">{card.subText}</div>
                </div>
                <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Managers Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Quote className="text-accent w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Leadership Quotes</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plant Manager */}
          <div className="bg-navy-card p-6 rounded-xl border border-border space-y-4">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Plant Manager</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Name" 
                className="finp w-full" 
                value={localManagerQuotes.find(q => q.id === 'plant_manager')?.name || ''} 
                onChange={e => handleManagerQuoteChange('plant_manager', 'name', e.target.value)}
                onBlur={() => handleManagerQuoteBlur('plant_manager')}
              />
              <textarea 
                placeholder="Quote" 
                className="finp w-full h-24 resize-none" 
                value={localManagerQuotes.find(q => q.id === 'plant_manager')?.quote || ''} 
                onChange={e => handleManagerQuoteChange('plant_manager', 'quote', e.target.value)}
                onBlur={() => handleManagerQuoteBlur('plant_manager')}
              />
              <div className="flex items-center gap-4">
                {plantManager.photoUrl && <img src={plantManager.photoUrl} className="w-12 h-12 rounded-full object-cover border border-accent" />}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="text-xs text-text-muted" 
                  onChange={e => handlePhotoUpload(e, (base64) => saveManagerQuote({ ...plantManager as ManagerQuote, photoUrl: base64 }))}
                />
              </div>
            </div>
          </div>

          {/* QC Manager */}
          <div className="bg-navy-card p-6 rounded-xl border border-border space-y-4">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">QC Manager</h3>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Name" 
                className="finp w-full" 
                value={localManagerQuotes.find(q => q.id === 'qc_manager')?.name || ''} 
                onChange={e => handleManagerQuoteChange('qc_manager', 'name', e.target.value)}
                onBlur={() => handleManagerQuoteBlur('qc_manager')}
              />
              <textarea 
                placeholder="Quote" 
                className="finp w-full h-24 resize-none" 
                value={localManagerQuotes.find(q => q.id === 'qc_manager')?.quote || ''} 
                onChange={e => handleManagerQuoteChange('qc_manager', 'quote', e.target.value)}
                onBlur={() => handleManagerQuoteBlur('qc_manager')}
              />
              <div className="flex items-center gap-4">
                {qcManager.photoUrl && <img src={qcManager.photoUrl} className="w-12 h-12 rounded-full object-cover border border-accent" />}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="text-xs text-text-muted" 
                  onChange={e => handlePhotoUpload(e, (base64) => saveManagerQuote({ ...qcManager as ManagerQuote, photoUrl: base64 }))}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Team Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Users className="text-accent w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Current Team Members</h2>
        </div>

        <div className="bg-navy-card p-6 rounded-xl border border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Name</label>
              <input type="text" className="finp w-full" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Designation</label>
              <input type="text" className="finp w-full" value={newMember.designation} onChange={e => setNewMember({...newMember, designation: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Photo</label>
              <div className="flex items-center gap-2">
                {newMember.photoUrl && <img src={newMember.photoUrl} className="w-8 h-8 rounded-full object-cover border border-accent" />}
                <input type="file" accept="image/*" className="text-[10px] text-text-muted w-full" onChange={e => handlePhotoUpload(e, (b) => setNewMember({...newMember, photoUrl: b}))} />
              </div>
            </div>
            <button onClick={handleAddMember} className="bg-accent text-navy font-bold py-2 px-4 rounded hover:opacity-90 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localTeamMembers.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-3 bg-navy-mid rounded-lg border border-border group">
                <div className="w-12 h-12 rounded-full bg-navy-card flex items-center justify-center overflow-hidden border border-border shrink-0">
                  {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <User className="text-text-muted w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{m.name}</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider truncate">{m.designation}</div>
                </div>
                <button onClick={() => handleDeleteMember(m.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legacy Members Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <History className="text-accent w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Legacy Members</h2>
        </div>

        <div className="bg-navy-card p-6 rounded-xl border border-border">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Name</label>
              <input type="text" className="finp w-full" value={newLegacy.name} onChange={e => setNewLegacy({...newLegacy, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Designation</label>
              <input type="text" className="finp w-full" value={newLegacy.designation} onChange={e => setNewLegacy({...newLegacy, designation: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Tenure</label>
              <input type="text" placeholder="e.g. 2018-2022" className="finp w-full" value={newLegacy.tenure} onChange={e => setNewLegacy({...newLegacy, tenure: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-text-muted">Photo</label>
              <div className="flex items-center gap-2">
                {newLegacy.photoUrl && <img src={newLegacy.photoUrl} className="w-8 h-8 rounded-full object-cover border border-accent" />}
                <input type="file" accept="image/*" className="text-[10px] text-text-muted w-full" onChange={e => handlePhotoUpload(e, (b) => setNewLegacy({...newLegacy, photoUrl: b}))} />
              </div>
            </div>
            <button onClick={handleAddLegacy} className="bg-accent text-navy font-bold py-2 px-4 rounded hover:opacity-90 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Legacy
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localLegacyMembers.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-3 bg-navy-mid rounded-lg border border-border group">
                <div className="w-12 h-12 rounded-full bg-navy-card flex items-center justify-center overflow-hidden border border-border shrink-0">
                  {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : <User className="text-text-muted w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{m.name}</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider truncate">{m.designation}</div>
                  <div className="text-[9px] text-accent/70 font-mono">{m.tenure}</div>
                </div>
                <button onClick={() => handleDeleteLegacy(m.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
