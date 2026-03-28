import React, { useState } from 'react';
import { useAppContext } from '../store';

interface PlantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  label: string;
}

export function PlantSettingsModal({ isOpen, onClose, category, label }: PlantSettingsModalProps) {
  const { customSettings, updateCustomSetting, removeCustomSetting } = useAppContext();
  const [newValue, setNewValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const items = customSettings[category] || [];

  const handleAdd = () => {
    if (newValue.trim()) {
      updateCustomSetting(category, newValue.trim());
      setNewValue('');
    }
  };

  const handleRemove = (item: string) => {
    removeCustomSetting(category, item);
    setConfirmDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-navy-card border border-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-navy">
          <h3 className="font-condensed font-bold text-lg text-text">Manage {label}s</h3>
          <button type="button" className="text-text-muted hover:text-accent transition-colors" onClick={onClose}>✕</button>
        </div>
        
        <div className="p-4 flex flex-col gap-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="finp flex-1" 
              placeholder={`Add new ${label}...`} 
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button 
              onClick={handleAdd}
              className="bg-accent text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {items.length === 0 ? (
              <div className="text-center py-8 text-text-dim text-xs italic bg-navy/30 rounded border border-dashed border-border">
                No custom {label.toLowerCase()}s added yet.
              </div>
            ) : (
              items.map((item: string) => (
                <div key={item} className="flex items-center justify-between bg-navy-light/30 p-2 rounded border border-border/50 group hover:border-accent/50 transition-colors">
                  <span className="text-sm text-text">{item}</span>
                  <div className="flex items-center gap-2">
                    {confirmDelete === item ? (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleRemove(item)}
                          className="text-[10px] bg-red text-white px-2 py-0.5 rounded hover:bg-red-600 transition-colors"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setConfirmDelete(null)}
                          className="text-[10px] bg-navy-light text-text px-2 py-0.5 rounded hover:bg-border transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmDelete(item)}
                        className="text-red/50 hover:text-red p-1 transition-colors"
                        title="Remove"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-navy flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-semibold bg-navy-light text-text hover:bg-border transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
