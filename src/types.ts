export interface Run {
  id: string;
  date: string;
  startTime: string;
  shift: string;
  line: string;
  batchNo: string;
  chemistStartup: string;
  chemistEndup: string;
  flavour: string;
  sku: number;
  lineSyrupVol: number;
  pmxAmount: number;
  lineFG: number;
  pmxFG: number;
  endDate: string;
  endTime: string;
  tpc?: number | string;
  yeast?: number | string;
  mold?: number | string;
  coliform: string;
  microDate: string;
  microResult: string;
  deviation: string;
  remarks: string;
  isLocked?: boolean;
  updatedAt: string;
  createdAt: string;
  uid?: string;
}

export interface SyrupEntry {
  date: string;
  ftd: number | null;
  mtd: number | null;
  ytd: number | null;
  updatedAt: string;
  uid?: string;
}

export interface DFConsumption {
  month: string; // e.g., '2026-01'
  amount: number;
  updatedAt: string;
  uid?: string;
}

export interface ExtLabTest {
  id: string;
  label: string;
  expiry: string;
  status: 'valid' | 'expired';
  updatedAt: string;
  uid?: string;
}

export interface BstiCert {
  name: string;
  doneDate: string;
  dueDate: string;
}

export interface DoeEnv {
  samplingQ1: string;
  samplingQ2: string;
  licenceExpiry: string;
}

export interface PlantMetrics {
  bsti: string;
  doeEnv: string;
  bstiList?: BstiCert[];
  lastBstiVisit?: string;
  doeEnvDetails?: DoeEnv;
  aibqs: number;
  qasScore?: number;
  scoreSavings: number;
  sugarSaving: number;
  // Capability
  capEoy: string;
  capYtd: string;
  capMicro: string;
  capAnalytical: string;
  capSensory: string;
  aibYearly?: { year: string; score: number }[];
  // Control (12mo, 6mo, 1mo)
  ctrl12Eoy: number; ctrl12Ytd: number; ctrl12Fg: number; ctrl12Iw: number;
  ctrl6Eoy: number; ctrl6Ytd: number; ctrl6Fg: number; ctrl6Iw: number;
  ctrl1Eoy: number; ctrl1Ytd: number; ctrl1Fg: number; ctrl1Iw: number;
  // Consumer (12mo, 6mo, 1mo)
  cons12Eoy: number; cons12Ytd: number; cons12Sensory: number; cons12Torque: number; cons12Pa: number;
  cons6Eoy: number; cons6Ytd: number; cons6Sensory: number; cons6Torque: number; cons6Pa: number;
  cons1Eoy: number; cons1Ytd: number; cons1Sensory: number; cons1Torque: number; cons1Pa: number;
  updatedAt: string;
}

export interface PlantCertificate {
  id: string;
  label: string;
  expiry: string;
  imageUrl?: string;
  updatedAt: string;
  uid?: string;
}

export interface PlantConfig {
  lines: string[];
  shifts: string[];
  chemists: string[];
  flavours: string[];
  skus: string[];
  deviations: string[];
  coliforms?: string[];
  microResults?: string[];
  landingBgUrl?: string;
  updatedAt: string;
}

export interface FinancialHistoryEntry {
  id: string;
  type: 'sugar' | 'conc';
  amount: number;
  date: string;
  updatedAt: string;
  uid?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  photoUrl?: string;
  updatedAt: string;
  uid?: string;
}

export interface LegacyMember {
  id: string;
  name: string;
  designation: string;
  tenure: string;
  photoUrl?: string;
  updatedAt: string;
  uid?: string;
}

export interface ManagerQuote {
  id: 'plant_manager' | 'qc_manager';
  name: string;
  quote: string;
  photoUrl?: string;
  updatedAt: string;
  uid?: string;
}

export interface AchievementCard {
  id: string;
  logoUrl?: string;
  boldText: string;
  subText: string;
  updatedAt: string;
  uid?: string;
}

export interface LandingPageConfig {
  missionTitle: string;
  missionText: string;
  missionTextSecondary?: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  deploymentDate: string; // ISO string
  deploymentTime: string; // HH:mm
  updatedAt: string;
  createdAt: string;
  uid?: string;
}
