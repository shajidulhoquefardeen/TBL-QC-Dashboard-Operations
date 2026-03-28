import { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { PlantMetrics } from '../types';

export function AibQsEntry() {
  const { plantMetrics, savePlantMetrics } = useAppContext();
  const [pm, setPm] = useState<PlantMetrics>({
    bsti: '', doeEnv: '', aibqs: 0, qasScore: 100, scoreSavings: 0, sugarSaving: 0,
    capEoy: 'Green', capYtd: 'Green', capMicro: 'Green', capAnalytical: 'Green', capSensory: 'Green',
    aibYearly: [],
    ctrl12Eoy: 0, ctrl12Ytd: 0, ctrl12Fg: 0, ctrl12Iw: 0,
    ctrl6Eoy: 0, ctrl6Ytd: 0, ctrl6Fg: 0, ctrl6Iw: 0,
    ctrl1Eoy: 0, ctrl1Ytd: 0, ctrl1Fg: 0, ctrl1Iw: 0,
    cons12Eoy: 0, cons12Ytd: 0, cons12Sensory: 0, cons12Torque: 0, cons12Pa: 0,
    cons6Eoy: 0, cons6Ytd: 0, cons6Sensory: 0, cons6Torque: 0, cons6Pa: 0,
    cons1Eoy: 0, cons1Ytd: 0, cons1Sensory: 0, cons1Torque: 0, cons1Pa: 0,
    updatedAt: ''
  });

  useEffect(() => {
    if (plantMetrics) {
      setPm(plantMetrics);
    }
  }, [plantMetrics]);

  const handleSave = () => {
    savePlantMetrics({ ...pm, updatedAt: new Date().toISOString() });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ backgroundColor: '#132244', border: '1px solid #1a3060', borderRadius: '8px', padding: '20px', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ fontFamily: 'Inter Condensed, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#60a5fa', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #1a3060', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏆 AIB & QAS Scores
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: '#6a8fc0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AIB Score</label>
            <input type="number" className="finp" value={pm.aibqs} onChange={e => setPm({...pm, aibqs: +e.target.value})} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', color: '#6a8fc0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>QAS Score</label>
            <input type="number" className="finp" value={pm.qasScore || 0} onChange={e => setPm({...pm, qasScore: +e.target.value})} />
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#6a8fc0', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #1a3060', paddingBottom: '4px' }}>AIB Yearly Trend</div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', marginBottom: '8px', paddingLeft: '8px', paddingRight: '8px' }}>
            <div style={{ fontSize: '9px', color: '#6a8fc0', fontWeight: 700, textTransform: 'uppercase' }}>Year</div>
            <div style={{ fontSize: '9px', color: '#6a8fc0', fontWeight: 700, textTransform: 'uppercase' }}>Score</div>
            <div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(pm.aibYearly || []).map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'center', backgroundColor: 'rgba(10, 14, 23, 0.3)', padding: '8px', borderRadius: '6px', border: '1px solid rgba(26, 48, 96, 0.5)' }}>
                <input type="text" className="finp" value={item.year} onChange={e => {
                  const newAib = [...(pm.aibYearly || [])];
                  newAib[i] = { ...newAib[i], year: e.target.value };
                  setPm({...pm, aibYearly: newAib});
                }} />
                <input type="number" className="finp" value={item.score} onChange={e => {
                  const newAib = [...(pm.aibYearly || [])];
                  newAib[i] = { ...newAib[i], score: +e.target.value };
                  setPm({...pm, aibYearly: newAib});
                }} />
                <button style={{ border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '4px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => {
                  const newAib = [...(pm.aibYearly || [])];
                  newAib.splice(i, 1);
                  setPm({...pm, aibYearly: newAib});
                }}>✕</button>
              </div>
            ))}
          </div>
          <button style={{ border: '1px dashed #1a3060', backgroundColor: 'transparent', color: '#6a8fc0', borderRadius: '4px', width: '100%', paddingTop: '8px', paddingBottom: '8px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s', marginTop: '12px' }} onClick={() => {
            setPm({...pm, aibYearly: [...(pm.aibYearly || []), { year: new Date().getFullYear().toString(), score: 0 }]});
          }}>+ Add Yearly Score</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button style={{ border: 'none', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '4px', paddingLeft: '24px', paddingRight: '24px', paddingTop: '8px', paddingBottom: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }} onClick={handleSave}>💾 Save AIB & QAS Data</button>
        </div>
      </div>
    </div>
  );
}
