export const CHEMISTS = ['Shahria','Habib','Soman','Rupu','Nabil','Futonto','Rubel','Arif','Maidul','NC1'];
export const LINES    = ['Line 1','Line 2','Line 3','Line 4'];
export const FLAVOURS = ['Pepsi','7UP EF','7UP Regular','Dew','Mirinda','Sting'];
export const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const F15 = (v: string) => ['pepsi','7up','7-up','dew'].some(k => String(v||'').toLowerCase().includes(k));
export const F14 = (v: string) => ['mirinda','sting'].some(k => String(v||'').toLowerCase().includes(k));

export const FLAVOUR_COLOR: Record<string, string> = {
  'Pepsi':'#1565c0','7UP EF':'#00695c','7UP Regular':'#007b3e',
  'Dew':'#558b2f','Mirinda':'#e65100','Sting':'#b71c1c'
};

export const AIB_SCORES = [
  {y:'2014',s:830},{y:'2015',s:835},{y:'2016',s:870},{y:'2017',s:870},
  {y:'2018',s:900},{y:'2019',s:935},{y:'2020',s:925},{y:'2021',s:925},
  {y:'2022',s:935},{y:'2023',s:935},{y:'2024',s:950},{y:'2025',s:925}
];

export const EXT_LABS = [
  {label:'Preform & PET bottles', expiry:'07/06/26', status:'valid'},
  {label:'FG, Chemicals, Water',  expiry:'09/30/26', status:'valid'},
  {label:'Sugar, Syrup',          expiry:'10/23/25', status:'expired'},
  {label:'IW',                    expiry:'03/22/26', status:'valid'},
  {label:'CO₂',                   expiry:'12/31/26', status:'valid'},
  {label:'Water Radio Activity',  expiry:'03/14/26', status:'expired'},
];

export const FLAVOUR_CHECKS: Record<string, string[]> = {
  'Pepsi': ['Brix', 'TA', 'CO2', 'Taste'],
  '7UP EF': ['Brix', 'TA', 'CO2', 'Taste'],
  '7UP Regular': ['Brix', 'TA', 'CO2', 'Taste'],
  'Dew': ['Brix', 'TA', 'CO2', 'Taste', 'Caffeine'],
  'Mirinda': ['Brix', 'TA', 'CO2', 'Taste', 'Color'],
  'Sting': ['Brix', 'TA', 'CO2', 'Taste', 'Caffeine', 'Color']
};

export const CERTS = [
  {label:'BSTI – BDS 1123:2022 (CSD)',  expiry:'30 Jun 2026'},
  {label:'BSTI – BDS 1240:2021 (BW)',   expiry:'30 Jun 2027'},
  {label:'BSTI – CSD PA',               expiry:'06 Jul 2027'},
  {label:'BSTI – BW PA',                expiry:'06 Jul 2027'},
  {label:'Sugar / Syrup External Lab',  expiry:'23 Oct 2025'},
  {label:'IW External Lab',             expiry:'22 Mar 2026'},
  {label:'CO₂ External Lab',            expiry:'31 Dec 2026'},
  {label:'Water Radio Activity',        expiry:'14 Mar 2026'},
  {label:'FSSC 22000',                  expiry:'23 May 2026'},
  {label:'DoE Environmental Licence',   expiry:'23 May 2026'},
  {label:'Preform & PET Bottles Lab',   expiry:'06 Jul 2026'},
];

export const PAGE: Record<string, {t: string, s: string}> = {
  home:     {t:'QC Department',        s:'Transcom Beverages Ltd. – Chittagong Plant'},
  qc:       {t:'QC Dashboard',         s:'Overall Quality Control – Chittagong Plant'},
  yield:    {t:'Yield Dashboard',       s:'ONE TEAM ONE DREAM – Concentrate Yield Analysis'},
  lineboard:{t:'Line Board',            s:'4-Line Operations Board – Live Status'},
  records:  {t:'All Records',           s:'Complete run log with completion indicators'},
  chemist:  {t:'Chemist Performance',   s:'Individual chemist yield analytics with calendar filter'},
  lineperf: {t:'Line Performance',      s:'Per-line yield analytics and production breakdown'},
  syrup:    {t:'Data Entry',        s:'Sugar & Concentrate yield entry by Syrup Chemist → feeds QC Dashboard'},
  settings: {t:'Settings',             s:'System configuration, import & export'},
};
