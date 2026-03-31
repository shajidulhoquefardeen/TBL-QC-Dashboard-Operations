import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Run, SyrupEntry, PlantMetrics, PlantConfig, PlantCertificate, FinancialHistoryEntry, TeamMember, LegacyMember, ManagerQuote, AchievementCard, LandingPageConfig, Notice } from './types';
import { CHEMISTS, F15, LINES, FLAVOURS } from './constants';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInAnonymously, signOut, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './utils/firestoreErrorHandler';

interface AppState {
  user: User | null;
  role: 'superadmin' | 'admin' | 'chemist' | null;
  isAuthReady: boolean;
  runs: Run[];
  sugarData: SyrupEntry[];
  concData: SyrupEntry[];
  dfData: any[];
  extLabData: any[];
  certsData: PlantCertificate[];
  financialHistory: FinancialHistoryEntry[];
  plantMetrics: PlantMetrics | null;
  teamMembers: TeamMember[];
  legacyMembers: LegacyMember[];
  managerQuotes: ManagerQuote[];
  achievementCards: AchievementCard[];
  landingConfig: LandingPageConfig | null;
  notices: Notice[];
  currentView: string;
  isModalOpen: boolean;
  editId: string | null;
  toastMsg: string | null;
  toastType: string;
  prefillLine: string | null;
  sidebarCollapsed: boolean;
}

interface AppContextType extends AppState {
  signIn: (username: string, password: string) => Promise<boolean>;
  logOut: () => void;
  setCurrentView: (view: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (id?: string | null, line?: string | null) => void;
  closeModal: () => void;
  saveRun: (run: Run) => Promise<void>;
  deleteRun: (id: string) => Promise<void>;
  toggleRunLock: (id: string) => Promise<void>;
  saveSugarEntry: (entry: SyrupEntry) => Promise<void>;
  deleteSugarEntry: (date: string) => Promise<void>;
  saveConcEntry: (entry: SyrupEntry) => Promise<void>;
  deleteConcEntry: (date: string) => Promise<void>;
  saveDFEntry: (entry: any) => Promise<void>;
  deleteDFEntry: (month: string) => Promise<void>;
  saveExtLabEntry: (entry: any) => Promise<void>;
  deleteExtLabEntry: (id: string) => Promise<void>;
  saveCert: (cert: PlantCertificate) => Promise<void>;
  deleteCert: (id: string) => Promise<void>;
  saveFinancialHistory: (entry: FinancialHistoryEntry) => Promise<void>;
  deleteFinancialHistory: (id: string) => Promise<void>;
  savePlantMetrics: (metrics: PlantMetrics) => Promise<void>;
  savePlantConfig: (config: any) => Promise<void>;
  saveTeamMember: (member: TeamMember) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  saveLegacyMember: (member: LegacyMember) => Promise<void>;
  deleteLegacyMember: (id: string) => Promise<void>;
  saveManagerQuote: (quote: ManagerQuote) => Promise<void>;
  saveAchievementCard: (card: AchievementCard) => Promise<void>;
  deleteAchievementCard: (id: string) => Promise<void>;
  saveLandingConfig: (config: LandingPageConfig) => Promise<void>;
  saveNotice: (notice: Notice) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  showToast: (msg: string, type?: string) => void;
  clearAll: () => Promise<void>;
  loadSampleData: () => Promise<void>;
  importCSV: (runs: Run[]) => Promise<void>;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  customSettings: any;
  updateCustomSetting: (key: string, value: string) => void;
  removeCustomSetting: (key: string, value: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'superadmin' | 'admin' | 'chemist' | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const [sugarData, setSugarData] = useState<SyrupEntry[]>([]);
  const [concData, setConcData] = useState<SyrupEntry[]>([]);
  const [dfData, setDfData] = useState<any[]>([]);
  const [extLabData, setExtLabData] = useState<any[]>([]);
  const [certsData, setCertsData] = useState<PlantCertificate[]>([]);
  const [financialHistory, setFinancialHistory] = useState<FinancialHistoryEntry[]>([]);
  const [plantMetrics, setPlantMetrics] = useState<PlantMetrics | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [legacyMembers, setLegacyMembers] = useState<LegacyMember[]>([]);
  const [managerQuotes, setManagerQuotes] = useState<ManagerQuote[]>([]);
  const [achievementCards, setAchievementCards] = useState<AchievementCard[]>([]);
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [customSettings, setCustomSettings] = useState<any>({
    lines: LINES,
    flavours: FLAVOURS,
    chemists: CHEMISTS,
    skus: ['250', '300', '500', '1000', '1500', '2000'],
    shifts: ['A - Morning (07:00-15:00)', 'B - Evening (15:00-23:00)', 'C - Night (23:00-07:00)'],
    deviations: ['None', 'DEV-01', 'DEV-02'],
    coliforms: ['Absent', 'Present'],
    microResults: ['Pending', 'PASS', 'FAIL']
  });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [prefillLine, setPrefillLine] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

  const updateCache = (key: string, value: any) => {
    const cached = localStorage.getItem('tbl_cache');
    const data = cached ? JSON.parse(cached) : {};
    localStorage.setItem('tbl_cache', JSON.stringify({...data, [key]: value}));
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('tbl_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
  }, []);

  const handleSetTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('tbl_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const savedRole = localStorage.getItem('tbl_user_role');
        setRole(savedRole as any);
      } else {
        // Check for mock user in localStorage
        const savedMockUser = localStorage.getItem('tbl_mock_user');
        const savedRole = localStorage.getItem('tbl_user_role');
        if (savedMockUser && savedRole) {
          setUser(JSON.parse(savedMockUser));
          setRole(savedRole as any);
        } else {
          setUser(null);
          setRole(null);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) {
      setRuns([]);
      setSugarData([]);
      setConcData([]);
      setDfData([]);
      setExtLabData([]);
      return;
    }

    const unsubscribes: (() => void)[] = [];

    const subscribeToCollection = (
      colName: string,
      queryConstraints: any[],
      setData: (data: any[]) => void,
      cacheKey: string
    ) => {
      const q = query(collection(db, colName), ...queryConstraints);
      const unsub = onSnapshot(q, (snap) => {
        const data: any[] = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        setData(data);
        
        // Update cache
        const cached = localStorage.getItem('tbl_cache');
        const cacheData = cached ? JSON.parse(cached) : {};
        cacheData[cacheKey] = data;
        localStorage.setItem('tbl_cache', JSON.stringify(cacheData));
        localStorage.setItem('tbl_cache_timestamp', Date.now().toString());
      }, (error) => {
        console.error(`Error fetching ${colName}:`, error);
        if (error instanceof Error && error.message.includes('Quota exceeded')) {
          showToast(`Firebase Quota Exceeded. Showing cached data for ${colName}.`, 'error');
        } else if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
          showToast(`Permission denied for ${colName}.`, 'error');
        } else {
          showToast(`Error loading ${colName}. Showing cached data.`, 'error');
        }
        // Fallback to cache
        const cached = localStorage.getItem('tbl_cache');
        if (cached) {
          const cacheData = JSON.parse(cached);
          if (cacheData[cacheKey]) setData(cacheData[cacheKey]);
        }
      });
      unsubscribes.push(unsub);
    };

    const subscribeToDoc = (
      colName: string,
      docId: string,
      setData: (data: any) => void,
      cacheKey: string,
      defaultData?: any
    ) => {
      const unsub = onSnapshot(doc(db, colName, docId), (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setData(data);
          
          // Update cache
          const cached = localStorage.getItem('tbl_cache');
          const cacheData = cached ? JSON.parse(cached) : {};
          cacheData[cacheKey] = data;
          localStorage.setItem('tbl_cache', JSON.stringify(cacheData));
        } else if (defaultData) {
          setData(defaultData);
        } else {
          setData(null);
        }
      }, (error) => {
        console.error(`Error fetching ${colName}/${docId}:`, error);
        // Fallback to cache
        const cached = localStorage.getItem('tbl_cache');
        if (cached) {
          const cacheData = JSON.parse(cached);
          if (cacheData[cacheKey]) setData(cacheData[cacheKey]);
        }
      });
      unsubscribes.push(unsub);
    };

    subscribeToCollection('df', [orderBy('month', 'desc')], setDfData, 'dfData');
    subscribeToCollection('teamMembers', [orderBy('updatedAt', 'desc')], setTeamMembers, 'teamMembers');
    subscribeToCollection('legacyMembers', [orderBy('updatedAt', 'desc')], setLegacyMembers, 'legacyMembers');
    subscribeToCollection('managerQuotes', [], setManagerQuotes, 'managerQuotes');
    subscribeToCollection('runs', [orderBy('date', 'desc')], setRuns, 'runs');
    subscribeToCollection('sugar', [orderBy('date', 'desc')], setSugarData, 'sugarData');
    subscribeToCollection('conc', [orderBy('date', 'desc')], setConcData, 'concData');
    subscribeToCollection('extLab', [orderBy('id', 'asc')], setExtLabData, 'extLabData');
    subscribeToCollection('certs', [orderBy('id', 'asc')], setCertsData, 'certsData');
    subscribeToCollection('financialHistory', [orderBy('updatedAt', 'desc')], setFinancialHistory, 'financialHistory');
    subscribeToCollection('achievementCards', [orderBy('updatedAt', 'asc')], setAchievementCards, 'achievementCards');
    subscribeToCollection('notices', [orderBy('deploymentDate', 'desc')], setNotices, 'notices');

    subscribeToDoc('settings', 'plantMetrics', setPlantMetrics, 'plantMetrics');
    subscribeToDoc('settings', 'landingConfig', setLandingConfig, 'landingConfig');

    const defaults: PlantConfig = {
      lines: LINES,
      flavours: FLAVOURS,
      chemists: CHEMISTS,
      skus: ['250', '300', '500', '1000', '1500', '2000'],
      shifts: ['A - Morning (07:00-15:00)', 'B - Evening (15:00-23:00)', 'C - Night (23:00-07:00)'],
      deviations: ['None', 'DEV-01', 'DEV-02'],
      coliforms: ['Absent', 'Present'],
      microResults: ['Pending', 'PASS', 'FAIL'],
      updatedAt: new Date().toISOString()
    };
    subscribeToDoc('settings', 'plantConfig', setCustomSettings, 'customSettings', defaults);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [isAuthReady, user]);

  const signIn = async (username: string, password: string) => {
    try {
      let userRole: 'superadmin' | 'admin' | 'chemist' | null = null;
      
      if (username === 'superadmin' && password === 'super123') {
        userRole = 'superadmin';
      } else if (username === 'admin' && password === '1234') {
        userRole = 'admin';
      } else if (username === 'chemist' && password === 'chemist123') {
        userRole = 'chemist';
      }

      if (userRole) {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.warn('Firebase Auth failed, using mock session', e);
          const mockUser = { uid: `mock-${userRole}`, email: `${userRole}@local` } as User;
          setUser(mockUser);
          localStorage.setItem('tbl_mock_user', JSON.stringify(mockUser));
        }
        setRole(userRole);
        localStorage.setItem('tbl_user_role', userRole);
        return true;
      } else {
        showToast('Invalid credentials', 'error');
        return false;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      showToast('Failed to sign in', 'error');
      return false;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      setRole(null);
      localStorage.removeItem('tbl_user_role');
      localStorage.removeItem('tbl_mock_user');
    }
  };

  const openModal = (id: string | null = null, line: string | null = null) => {
    setEditId(id);
    setPrefillLine(line);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setPrefillLine(null);
  };

  const saveRun = async (run: Run) => {
    console.log('Attempting to save run:', run);
    if (!user) {
      console.error('Save failed: No user authenticated');
      return;
    }
    const existing = runs.find(r => r.id === run.id);
    if (existing?.isLocked && role !== 'superadmin') {
      showToast('This run is locked and cannot be modified', 'error');
      return;
    }
    setRuns(prev => {
      const exists = prev.find(r => r.id === run.id);
      if (exists) return prev.map(r => r.id === run.id ? run : r);
      return [...prev, run].sort((a,b) => b.date.localeCompare(a.date));
    });
    try {
      const runWithUid = { ...run, uid: user.uid };
      console.log('Saving to Firestore at runs/', run.id, runWithUid);
      await setDoc(doc(db, 'runs', run.id), runWithUid);
      console.log('Run saved successfully in Firestore');
      showToast('Run saved successfully');
    } catch (error) {
      console.error('Error saving run to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, `runs/${run.id}`);
    }
  };

  const deleteRun = async (id: string) => {
    if (!user) return;
    const run = runs.find(r => r.id === id);
    if (run?.isLocked && role !== 'superadmin') {
      showToast('This run is locked and cannot be deleted', 'error');
      return;
    }
    setRuns(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'runs', id));
      showToast('Run deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `runs/${id}`);
    }
  };

  const toggleRunLock = async (id: string) => {
    if (!user || role !== 'superadmin') return;
    const run = runs.find(r => r.id === id);
    if (!run) return;
    setRuns(prev => prev.map(r => r.id === id ? { ...r, isLocked: !r.isLocked } : r));
    try {
      await setDoc(doc(db, 'runs', id), { ...run, isLocked: !run.isLocked, updatedAt: new Date().toISOString() });
      showToast(run.isLocked ? 'Run unlocked' : 'Run locked');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `runs/${id}`);
    }
  };

  const saveSugarEntry = async (entry: SyrupEntry) => {
    console.log('Attempting to save sugar entry:', entry);
    if (!user) {
      console.error('Save failed: No user authenticated');
      return;
    }
    setSugarData(prev => {
      const exists = prev.find(s => s.date === entry.date);
      if (exists) return prev.map(s => s.date === entry.date ? entry : s);
      return [...prev, entry].sort((a,b) => b.date.localeCompare(a.date));
    });
    try {
      const entryWithUid = { ...entry, uid: user.uid };
      console.log('Saving to Firestore at sugar/', entry.date, entryWithUid);
      await setDoc(doc(db, 'sugar', entry.date), entryWithUid);
      console.log('Sugar entry saved successfully in Firestore');
      showToast('Sugar entry saved');
    } catch (error) {
      console.error('Error saving sugar entry to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, `sugar/${entry.date}`);
    }
  };

  const deleteSugarEntry = async (date: string) => {
    if (!user) return;
    setSugarData(prev => prev.filter(s => s.date !== date));
    try {
      await deleteDoc(doc(db, 'sugar', date));
      showToast('Sugar entry deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sugar/${date}`);
    }
  };

  const saveConcEntry = async (entry: SyrupEntry) => {
    console.log('Attempting to save conc entry:', entry);
    if (!user) {
      console.error('Save failed: No user authenticated');
      return;
    }
    setConcData(prev => {
      const exists = prev.find(c => c.date === entry.date);
      if (exists) return prev.map(c => c.date === entry.date ? entry : c);
      return [...prev, entry].sort((a,b) => b.date.localeCompare(a.date));
    });
    try {
      const entryWithUid = { ...entry, uid: user.uid };
      console.log('Saving to Firestore at conc/', entry.date, entryWithUid);
      await setDoc(doc(db, 'conc', entry.date), entryWithUid);
      console.log('Conc entry saved successfully in Firestore');
      showToast('Concentrate entry saved');
    } catch (error) {
      console.error('Error saving conc entry to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, `conc/${entry.date}`);
    }
  };

  const deleteConcEntry = async (date: string) => {
    if (!user) return;
    setConcData(prev => prev.filter(c => c.date !== date));
    try {
      await deleteDoc(doc(db, 'conc', date));
      showToast('Concentrate entry deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `conc/${date}`);
    }
  };

  const saveDFEntry = async (entry: any) => {
    console.log('Attempting to save DF entry:', entry);
    if (!user) {
      console.error('Save failed: No user authenticated');
      return;
    }
    setDfData(prev => {
      const exists = prev.find(d => d.month === entry.month);
      if (exists) return prev.map(d => d.month === entry.month ? entry : d);
      return [...prev, entry].sort((a,b) => b.month.localeCompare(a.month));
    });
    try {
      const entryWithUid = { ...entry, uid: user.uid };
      console.log('Saving to Firestore at df/', entry.month, entryWithUid);
      await setDoc(doc(db, 'df', entry.month), entryWithUid);
      console.log('DF entry saved successfully in Firestore');
      showToast('DF Consumption entry saved');
    } catch (error) {
      console.error('Error saving DF entry to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, `df/${entry.month}`);
    }
  };

  const deleteDFEntry = async (month: string) => {
    if (!user) return;
    setDfData(prev => prev.filter(d => d.month !== month));
    try {
      await deleteDoc(doc(db, 'df', month));
      showToast('DF Consumption entry deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `df/${month}`);
    }
  };

  const saveExtLabEntry = async (entry: any) => {
    console.log('Attempting to save extLab entry:', entry);
    if (!user) {
      console.error('Save failed: No user authenticated');
      return;
    }
    setExtLabData(prev => {
      const exists = prev.find(e => e.id === entry.id);
      if (exists) return prev.map(e => e.id === entry.id ? entry : e);
      return [...prev, entry];
    });
    try {
      const entryWithUid = { ...entry, uid: user.uid };
      console.log('Saving to Firestore at extLab/', entry.id, entryWithUid);
      await setDoc(doc(db, 'extLab', entry.id), entryWithUid);
      console.log('ExtLab entry saved successfully in Firestore');
      showToast('External Lab entry saved');
    } catch (error) {
      console.error('Error saving extLab entry to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, `extLab/${entry.id}`);
    }
  };

  const saveCert = async (cert: PlantCertificate) => {
    if (!user || (role !== 'admin' && role !== 'superadmin')) {
      showToast('Only Admin or Super Admin can manage certificates', 'error');
      return;
    }
    setCertsData(prev => {
      const exists = prev.find(c => c.id === cert.id);
      if (exists) return prev.map(c => c.id === cert.id ? cert : c);
      return [...prev, cert];
    });
    try {
      await setDoc(doc(db, 'certs', cert.id), { ...cert, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Certificate updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `certs/${cert.id}`);
    }
  };

  const deleteCert = async (id: string) => {
    if (!user || role !== 'superadmin') {
      showToast('Only Super Admin can remove certificates', 'error');
      return;
    }
    setCertsData(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'certs', id));
      showToast('Certificate removed');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `certs/${id}`);
    }
  };

  const saveFinancialHistory = async (entry: FinancialHistoryEntry) => {
    if (!user) return;
    setFinancialHistory(prev => {
      const exists = prev.find(h => h.id === entry.id);
      if (exists) return prev.map(h => h.id === entry.id ? entry : h);
      return [...prev, entry].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
    });
    try {
      await setDoc(doc(db, 'financialHistory', entry.id), { ...entry, uid: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `financialHistory/${entry.id}`);
    }
  };

  const deleteFinancialHistory = async (id: string) => {
    if (!user) return;
    setFinancialHistory(prev => prev.filter(h => h.id !== id));
    try {
      await deleteDoc(doc(db, 'financialHistory', id));
      showToast('History entry deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `financialHistory/${id}`);
    }
  };

  const deleteExtLabEntry = async (id: string) => {
    if (!user) return;
    setExtLabData(prev => prev.filter(e => e.id !== id));
    try {
      await deleteDoc(doc(db, 'extLab', id));
      showToast('External Lab entry deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `extLab/${id}`);
    }
  };

  const savePlantMetrics = async (metrics: PlantMetrics) => {
    console.log('Attempting to save plant metrics:', metrics);
    if (!user) {
      console.error('Save failed: No user authenticated');
      return;
    }
    setPlantMetrics(metrics);
    try {
      console.log('Saving to Firestore at settings/plantMetrics', metrics);
      await setDoc(doc(db, 'settings', 'plantMetrics'), metrics);
      console.log('Plant metrics saved successfully in Firestore');
      showToast('Plant metrics saved');
    } catch (error) {
      console.error('Error saving plant metrics to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, 'settings/plantMetrics');
    }
  };

  const savePlantConfig = async (config: any) => {
    if (!user) return;
    setCustomSettings(config);
    updateCache('customSettings', config);
    try {
      await setDoc(doc(db, 'settings', 'plantConfig'), { ...config, updatedAt: new Date().toISOString() });
      showToast('Plant configuration updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/plantConfig');
    }
  };

  const saveTeamMember = async (member: TeamMember) => {
    if (!user) return;
    
    // Update local state immediately
    setTeamMembers(prev => {
      const exists = prev.find(m => m.id === member.id);
      if (exists) return prev.map(m => m.id === member.id ? member : m);
      return [...prev, member];
    });

    // Update cache
    updateCache('teamMembers', teamMembers.find(m => m.id === member.id) ? teamMembers.map(m => m.id === member.id ? member : m) : [...teamMembers, member]);

    try {
      await setDoc(doc(db, 'teamMembers', member.id), { ...member, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Team member saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teamMembers/${member.id}`);
    }
  };

  const deleteTeamMember = async (id: string) => {
    if (!user) return;
    
    // Update local state immediately
    setTeamMembers(prev => prev.filter(m => m.id !== id));

    // Update cache
    updateCache('teamMembers', teamMembers.filter(m => m.id !== id));

    try {
      await deleteDoc(doc(db, 'teamMembers', id));
      showToast('Team member deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teamMembers/${id}`);
    }
  };

  const saveLegacyMember = async (member: LegacyMember) => {
    if (!user) return;
    setLegacyMembers(prev => {
      const exists = prev.find(m => m.id === member.id);
      if (exists) return prev.map(m => m.id === member.id ? member : m);
      return [...prev, member];
    });
    updateCache('legacyMembers', legacyMembers.find(m => m.id === member.id) ? legacyMembers.map(m => m.id === member.id ? member : m) : [...legacyMembers, member]);
    try {
      await setDoc(doc(db, 'legacyMembers', member.id), { ...member, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Legacy member saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `legacyMembers/${member.id}`);
    }
  };

  const deleteLegacyMember = async (id: string) => {
    if (!user) return;
    setLegacyMembers(prev => prev.filter(m => m.id !== id));
    updateCache('legacyMembers', legacyMembers.filter(m => m.id !== id));
    try {
      await deleteDoc(doc(db, 'legacyMembers', id));
      showToast('Legacy member deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `legacyMembers/${id}`);
    }
  };

  const saveManagerQuote = async (quote: ManagerQuote) => {
    if (!user) return;
    setManagerQuotes(prev => {
      const exists = prev.find(m => m.id === quote.id);
      if (exists) return prev.map(m => m.id === quote.id ? quote : m);
      return [...prev, quote];
    });
    updateCache('managerQuotes', managerQuotes.find(m => m.id === quote.id) ? managerQuotes.map(m => m.id === quote.id ? quote : m) : [...managerQuotes, quote]);
    try {
      await setDoc(doc(db, 'managerQuotes', quote.id), { ...quote, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Manager quote updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `managerQuotes/${quote.id}`);
    }
  };

  const saveAchievementCard = async (card: AchievementCard) => {
    if (!user) return;
    setAchievementCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) return prev.map(c => c.id === card.id ? card : c);
      return [...prev, card];
    });
    updateCache('achievementCards', achievementCards.find(c => c.id === card.id) ? achievementCards.map(c => c.id === card.id ? card : c) : [...achievementCards, card]);
    try {
      await setDoc(doc(db, 'achievementCards', card.id), { ...card, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Achievement card saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `achievementCards/${card.id}`);
    }
  };

  const deleteAchievementCard = async (id: string) => {
    if (!user) return;
    setAchievementCards(prev => prev.filter(c => c.id !== id));
    updateCache('achievementCards', achievementCards.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'achievementCards', id));
      showToast('Achievement card deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `achievementCards/${id}`);
    }
  };

  const saveLandingConfig = async (config: LandingPageConfig) => {
    if (!user) return;
    setLandingConfig(config);
    updateCache('landingConfig', config);
    try {
      await setDoc(doc(db, 'settings', 'landingConfig'), { ...config, updatedAt: new Date().toISOString() });
      showToast('Landing page configuration saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/landingConfig');
    }
  };

  const saveNotice = async (notice: Notice) => {
    if (!user) return;
    setNotices(prev => {
      const exists = prev.find(n => n.id === notice.id);
      if (exists) return prev.map(n => n.id === notice.id ? notice : n);
      return [...prev, notice];
    });
    updateCache('notices', notices.find(n => n.id === notice.id) ? notices.map(n => n.id === notice.id ? notice : n) : [...notices, notice]);
    try {
      await setDoc(doc(db, 'notices', notice.id), { ...notice, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Notice saved successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notices/${notice.id}`);
    }
  };

  const deleteNotice = async (id: string) => {
    if (!user) return;
    setNotices(prev => prev.filter(n => n.id !== id));
    updateCache('notices', notices.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notices', id));
      showToast('Notice deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notices/${id}`);
    }
  };

  const updateCustomSetting = async (key: string, value: string) => {
    const currentList = customSettings[key] || [];
    if (currentList.includes(value)) return;
    const newSettings = { ...customSettings, [key]: [...currentList, value] };
    await savePlantConfig(newSettings);
  };

  const removeCustomSetting = async (key: string, value: string) => {
    const currentList = customSettings[key] || [];
    const newSettings = { ...customSettings, [key]: currentList.filter((v: string) => v !== value) };
    await savePlantConfig(newSettings);
  };

  const showToast = (msg: string, type = '') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const clearAll = async () => {
    if (!user || role !== 'superadmin') {
      showToast('Only Super Admin can clear data', 'error');
      return;
    }
    setRuns([]);
    setSugarData([]);
    setConcData([]);
    try {
      const batch = writeBatch(db);
      runs.forEach(r => batch.delete(doc(db, 'runs', r.id)));
      sugarData.forEach(s => batch.delete(doc(db, 'sugar', s.date)));
      concData.forEach(c => batch.delete(doc(db, 'conc', c.date)));
      await batch.commit();
      showToast('All data cleared');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_delete');
    }
  };

  const loadSampleData = async () => {
    if (!user || role !== 'superadmin') {
      showToast('Only Super Admin can load sample data', 'error');
      return;
    }
    try {
      const batch = writeBatch(db);
      const flavs=['Pepsi','7UP EF','Dew','Mirinda','7UP EF','Dew','Pepsi'];
      const skus=[200,500,1000,1750];
      const lineArr=['Line 3','Line 4','Line 1','Line 3','Line 4'];
      const shifts=['A','B','C'];
      const now=new Date();

      let count = 0;
      for(let d=89;d>=0;d--){
        const dt=new Date(now); dt.setDate(dt.getDate()-d);
        const dStr=dt.toISOString().slice(0,10);
        const numRuns=Math.floor(Math.random()*3)+2;
        for(let ri=0;ri<numRuns;ri++){
          if (count >= 400) break; // Firestore batch limit is 500
          const flav=flavs[(d+ri)%flavs.length];
          const sku =skus[ri%skus.length];
          const line=lineArr[ri%lineArr.length];
          const cs=CHEMISTS[Math.floor(Math.random()*9)];
          const ce=CHEMISTS[Math.floor(Math.random()*9)];
          const btls=sku===1000?12:sku===1750?6:24;
          const ratio=F15(flav)?6:5;
          const lSyr=Math.round((3000+Math.random()*18000)*10)/10;
          const pmxAmt=Math.random()>0.7?Math.round(Math.random()*30*10)/10:0;
          const pmxVol=pmxAmt*19;
          const tSyr=lSyr+pmxVol;
          const denom=tSyr/((sku/ratio)*btls/1000);
          const yFactor=0.96+Math.random()*0.07;
          const tFG=Math.round(denom*yFactor);
          const lFG=Math.round(tFG*(1-pmxAmt/(pmxAmt+lSyr/ratio+1)));
          const pFG=tFG-lFG;
          const hasMicro=d>6;
          const r: Run = {
            id:(dStr+'_'+line+'_'+ri).replace(/[^a-z0-9]/gi,'_'),
            date:dStr, shift:shifts[ri%3], line,
            chemistStartup:cs, chemistEndup:ce,
            flavour:flav, sku, batchNo:`B${dStr.replace(/-/g,'').slice(2)}-L${line.slice(-1)}${ri+1}`,
            lineSyrupVol:lSyr, pmxAmount:pmxAmt,
            lineFG:lFG<0?tFG:lFG, pmxFG:pmxAmt>0?pFG:0,
            endDate:dStr, startTime:'07:00', endTime:'14:30',
            remarks:'', createdAt:dt.toISOString(),
            updatedAt: dt.toISOString(),
            coliform: 'absent',
            microDate: '',
            microResult: 'pass',
            deviation: '',
            uid: user.uid
          };
          if(hasMicro){r.tpc=Math.random()>0.9?Math.round(Math.random()*5):0;r.yeast=0;r.mold=0;r.coliform='absent';r.microResult='pass';r.microDate=dStr;}
          batch.set(doc(db, 'runs', r.id), r);
          count++;
        }
      }
      await batch.commit();
      showToast(`✔ Loaded sample runs`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_load_sample');
    }
  };

  const importCSV = async (importedRuns: Run[]) => {
    if (!user || role !== 'superadmin') {
      showToast('Only Super Admin can import data', 'error');
      return;
    }
    try {
      const batch = writeBatch(db);
      let count = 0;
      let skipped = 0;
      importedRuns.forEach(r => {
        if (!runs.find(x => x.id === r.id) && count < 400) {
          batch.set(doc(db, 'runs', r.id), { ...r, uid: user.uid });
          count++;
        } else {
          skipped++;
        }
      });
      await batch.commit();
      if (count > 0) {
        showToast(`✔ Imported ${count} runs. ${skipped > 0 ? `(${skipped} skipped)` : ''}`);
      } else {
        showToast(`No new runs imported. ${skipped} runs already exist.`, 'warning');
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast('Import failed. Check CSV format and permissions.', 'error');
      handleFirestoreError(error, OperationType.WRITE, 'batch_import');
    }
  };

  return (
    <AppContext.Provider value={{
      user, role, isAuthReady, theme, setTheme: handleSetTheme,
      runs, sugarData, concData, dfData, extLabData, certsData, financialHistory, plantMetrics, currentView, setCurrentView,
      teamMembers, legacyMembers, managerQuotes, achievementCards, landingConfig, notices,
      sidebarCollapsed, setSidebarCollapsed,
      isModalOpen, openModal, closeModal, editId, prefillLine,
      saveRun, deleteRun, toggleRunLock, saveSugarEntry, deleteSugarEntry,
      saveConcEntry, deleteConcEntry, saveDFEntry, deleteDFEntry,
      saveExtLabEntry, deleteExtLabEntry, saveCert, deleteCert, saveFinancialHistory, deleteFinancialHistory, savePlantMetrics, savePlantConfig, 
      saveTeamMember, deleteTeamMember, saveLegacyMember, deleteLegacyMember, saveManagerQuote,
      saveAchievementCard, deleteAchievementCard, saveLandingConfig, saveNotice, deleteNotice,
      toastMsg, toastType, showToast,
      clearAll, loadSampleData, importCSV, signIn, logOut,
      customSettings, updateCustomSetting, removeCustomSetting
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
