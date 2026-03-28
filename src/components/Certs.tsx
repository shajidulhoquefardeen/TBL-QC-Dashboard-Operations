import React, { useEffect, useRef, useState } from 'react';
import { CERTS } from '../constants';
import { useAppContext } from '../store';
import { PlantCertificate } from '../types';

export function Certs() {
  const { certsData, saveCert, deleteCert, role } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedCertId = useRef<string | null>(null);

  const isSuperAdmin = role === 'superadmin';
  const isAdminOrSuper = role === 'admin' || role === 'superadmin';

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);

  // Initialize certs in Firestore if they don't exist
  useEffect(() => {
    const initialized = localStorage.getItem('certs_initialized');
    if (!initialized && certsData.length === 0) {
      CERTS.forEach(c => {
        const id = c.label.toLowerCase().replace(/[^a-z0-9]/g, '-');
        saveCert({
          id,
          label: c.label,
          expiry: c.expiry,
          updatedAt: new Date().toISOString()
        });
      });
      localStorage.setItem('certs_initialized', 'true');
    }
  }, [certsData.length, saveCert]);

  const handleUploadClick = (id: string) => {
    selectedCertId.current = id;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (selectedCertId.current === 'NEW') {
          setNewImage(base64String);
        } else if (selectedCertId.current) {
          const cert = certsData.find(c => c.id === selectedCertId.current);
          if (cert) {
            saveCert({
              ...cert,
              imageUrl: base64String
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCert = () => {
    if (!newLabel || !newExpiry) return alert('Label and Expiry are required');
    const id = `manual-${Date.now()}`;
    saveCert({
      id,
      label: newLabel,
      expiry: formatDateForDisplay(newExpiry),
      imageUrl: newImage || undefined,
      updatedAt: new Date().toISOString()
    });
    setNewLabel('');
    setNewExpiry('');
    setNewImage(null);
    setIsAdding(false);
  };

  const [editingCert, setEditingCert] = useState<PlantCertificate | null>(null);
  const [viewingFullImage, setViewingFullImage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const handleUpdateCert = () => {
    if (!editingCert) return;
    saveCert({
      ...editingCert,
      expiry: formatDateForDisplay(editingCert.expiry),
      updatedAt: new Date().toISOString()
    });
    setEditingCert(null);
  };

  const displayCerts = certsData.length > 0 ? certsData : CERTS.map(c => ({
    id: c.label.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    label: c.label,
    expiry: c.expiry
  }));

  return (
    <div className="p-[18px_22px]">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange}
      />
      
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-condensed font-black text-xl tracking-tight text-text uppercase">Plant Certifications</h2>
          <p className="text-[10px] text-text-muted mt-0.5">Official quality and compliance certificates for Transcom Beverages Ltd. – Chittagong Plant</p>
        </div>
        {isAdminOrSuper && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-green text-white font-condensed font-bold py-2 px-4 rounded-md text-xs uppercase tracking-wider hover:bg-green-600 transition-colors shadow-lg"
          >
            {isAdding ? 'Cancel' : '+ Add New Certificate'}
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-8 bg-navy-card border border-accent/30 rounded-xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-condensed font-bold text-accent uppercase tracking-widest text-sm mb-4">Manual Certificate Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Certificate Name</label>
              <input 
                type="text" 
                className="bg-navy-light border border-border rounded px-3 py-2 text-xs text-text focus:border-accent outline-none"
                placeholder="e.g. ISO 9001:2015"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Expiry Date</label>
              <input 
                type="date" 
                className="bg-navy-light border border-border rounded px-3 py-2 text-xs text-text focus:border-accent outline-none w-full"
                value={newExpiry}
                onChange={e => setNewExpiry(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { selectedCertId.current = 'NEW'; fileInputRef.current?.click(); }}
                className="flex-1 bg-navy-light border border-border text-text-muted font-bold py-2 rounded-md text-[10px] uppercase tracking-wider hover:border-accent transition-colors"
              >
                {newImage ? '✅ Image Selected' : '📁 Upload Picture'}
              </button>
              <button 
                onClick={handleAddCert}
                className="flex-1 bg-accent text-navy font-bold py-2 rounded-md text-[10px] uppercase tracking-wider hover:bg-white transition-colors"
              >
                Save Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-card border border-accent/30 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-condensed font-bold text-accent uppercase tracking-widest text-lg mb-6">Edit Certificate Details</h3>
            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Certificate Name</label>
                <input 
                  type="text" 
                  className="bg-navy-light border border-border rounded-lg px-4 py-3 text-sm text-text focus:border-accent outline-none"
                  value={editingCert.label}
                  onChange={e => setEditingCert({ ...editingCert, label: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Expiry Date</label>
                <input 
                  type="date" 
                  className="bg-navy-light border border-border rounded-lg px-4 py-3 text-sm text-text focus:border-accent outline-none w-full"
                  value={formatDateForInput(editingCert.expiry)}
                  onChange={e => setEditingCert({ ...editingCert, expiry: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setEditingCert(null)}
                  className="flex-1 bg-navy-light border border-border text-text-muted font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateCert}
                  className="flex-1 bg-accent text-navy font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-white transition-colors"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayCerts.map((cert) => (
          <div key={cert.id} className="bg-navy-card border border-border rounded-xl overflow-hidden shadow-xl transition-all hover:scale-[1.02] group relative">
            <div className="aspect-[3/4] bg-navy-light relative overflow-hidden">
              <img 
                src={cert.imageUrl || `https://picsum.photos/seed/${cert.label.replace(/\s/g, '')}/800/1100`} 
                alt={cert.label}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-2">
                {isAdminOrSuper && (
                  <button 
                    onClick={() => handleUploadClick(cert.id)}
                    className="w-full bg-accent text-navy font-condensed font-bold py-2 rounded-md text-xs uppercase tracking-wider hover:bg-white transition-colors"
                  >
                    Change Picture
                  </button>
                )}
                <button 
                  onClick={() => setViewingFullImage(cert.imageUrl || `https://picsum.photos/seed/${cert.label.replace(/\s/g, '')}/800/1100`)}
                  className="w-full bg-pepsi text-white font-condensed font-bold py-2 rounded-md text-xs uppercase tracking-wider hover:bg-white hover:text-pepsi transition-colors"
                >
                  View Full Certificate
                </button>
                {isAdminOrSuper && (
                  <button 
                    onClick={() => setEditingCert(cert)}
                    className="w-full bg-navy-light text-text font-condensed font-bold py-2 rounded-md text-xs uppercase tracking-wider hover:bg-white hover:text-navy transition-colors"
                  >
                    Edit Details
                  </button>
                )}
                {isSuperAdmin && (
                  <button 
                    onClick={() => setConfirmDeleteId(cert.id)}
                    className="w-full bg-red/20 text-red border border-red/30 font-condensed font-bold py-2 rounded-md text-xs uppercase tracking-wider hover:bg-red hover:text-white transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-condensed font-bold text-sm text-text leading-tight mb-1">{cert.label}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] text-text-dim uppercase font-bold tracking-wider">Expiry: {cert.expiry}</span>
                <span className={`w-2 h-2 rounded-full ${new Date(cert.expiry) < new Date() ? 'bg-red animate-pulse' : 'bg-green'}`}></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewingFullImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setViewingFullImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-300">
            <img 
              src={viewingFullImage} 
              alt="Full Certificate" 
              className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              className="absolute -top-12 right-0 text-white hover:text-accent transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
              onClick={() => setViewingFullImage(null)}
            >
              Close Viewer <span className="text-2xl">×</span>
            </button>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-navy-card border border-red/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red text-3xl">⚠</span>
            </div>
            <h3 className="font-condensed font-bold text-text text-center uppercase tracking-widest text-lg mb-2">Confirm Removal</h3>
            <p className="text-text-muted text-center text-xs mb-8">Are you sure you want to remove this certificate? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-navy-light border border-border text-text-muted font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteCert(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="flex-1 bg-red text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-red-600 transition-colors"
              >
                Remove Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
