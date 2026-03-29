import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Run, SyrupEntry, PlantMetrics, PlantConfig, PlantCertificate, FinancialHistoryEntry, TeamMember, LegacyMember, ManagerQuote, AchievementCard, LandingPageConfig } from './types';
import { CHEMISTS, F15, LINES, FLAVOURS } from './constants';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInAnonymously, signOut, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, writeBatch } from 'firebase/firestore';
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
  const [customSettings, setCustomSettings] = useState<any>({ lines: [], flavours: [], chemists: [], skus: [], shifts: [], deviations: [], coliforms: [], microResults: [] });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentView, setCurrentView] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [prefillLine, setPrefillLine] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

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

    const unsubRuns = onSnapshot(
      query(collection(db, 'runs'), orderBy('date', 'desc')),
      (snapshot) => {
        console.log('Runs snapshot received, size:', snapshot.size);
        const r: Run[] = [];
        snapshot.forEach((doc) => r.push(doc.data() as Run));
        setRuns(r);
      },
      (error) => {
        console.error('Runs snapshot error:', error);
        handleFirestoreError(error, OperationType.LIST, 'runs');
      }
    );

    const unsubSugar = onSnapshot(
      query(collection(db, 'sugar'), orderBy('date', 'desc')),
      (snapshot) => {
        console.log('Sugar snapshot received, size:', snapshot.size);
        const s: SyrupEntry[] = [];
        snapshot.forEach((doc) => s.push(doc.data() as SyrupEntry));
        setSugarData(s);
      },
      (error) => {
        console.error('Sugar snapshot error:', error);
        handleFirestoreError(error, OperationType.LIST, 'sugar');
      }
    );

    const unsubConc = onSnapshot(
      query(collection(db, 'conc'), orderBy('date', 'desc')),
      (snapshot) => {
        console.log('Conc snapshot received, size:', snapshot.size);
        const c: SyrupEntry[] = [];
        snapshot.forEach((doc) => c.push(doc.data() as SyrupEntry));
        setConcData(c);
      },
      (error) => {
        console.error('Conc snapshot error:', error);
        handleFirestoreError(error, OperationType.LIST, 'conc');
      }
    );

    const unsubDf = onSnapshot(
      query(collection(db, 'df'), orderBy('month', 'desc')),
      (snapshot) => {
        console.log('DF snapshot received, size:', snapshot.size);
        const d: any[] = [];
        snapshot.forEach((doc) => d.push(doc.data()));
        setDfData(d);
      },
      (error) => {
        console.error('DF snapshot error:', error);
        handleFirestoreError(error, OperationType.LIST, 'df');
      }
    );

    const unsubExtLab = onSnapshot(
      query(collection(db, 'extLab'), orderBy('id', 'asc')),
      (snapshot) => {
        const e: any[] = [];
        snapshot.forEach((doc) => e.push(doc.data()));
        setExtLabData(e);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'extLab')
    );

    const unsubCerts = onSnapshot(
      query(collection(db, 'certs'), orderBy('id', 'asc')),
      (snapshot) => {
        const c: PlantCertificate[] = [];
        snapshot.forEach((doc) => c.push(doc.data() as PlantCertificate));
        setCertsData(c);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'certs')
    );

    const unsubFinancialHistory = onSnapshot(
      query(collection(db, 'financialHistory'), orderBy('updatedAt', 'desc')),
      (snapshot) => {
        const h: FinancialHistoryEntry[] = [];
        snapshot.forEach((doc) => h.push(doc.data() as FinancialHistoryEntry));
        setFinancialHistory(h);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'financialHistory')
    );

    const unsubPlantMetrics = onSnapshot(
      doc(db, 'settings', 'plantMetrics'),
      (docSnap) => {
        if (docSnap.exists()) {
          setPlantMetrics(docSnap.data() as PlantMetrics);
        } else {
          setPlantMetrics(null);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings/plantMetrics')
    );

    const unsubPlantConfig = onSnapshot(
      doc(db, 'settings', 'plantConfig'),
      (docSnap) => {
        if (docSnap.exists()) {
          setCustomSettings(docSnap.data());
        } else {
          // Initialize with defaults if it's the first time
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
          savePlantConfig(defaults);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings/plantConfig')
    );

    const unsubTeam = onSnapshot(
      query(collection(db, 'teamMembers'), orderBy('updatedAt', 'desc')),
      (snapshot) => {
        const t: TeamMember[] = [];
        snapshot.forEach((doc) => t.push(doc.data() as TeamMember));
        setTeamMembers(t);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'teamMembers')
    );

    const unsubLegacy = onSnapshot(
      query(collection(db, 'legacyMembers'), orderBy('updatedAt', 'desc')),
      (snapshot) => {
        const l: LegacyMember[] = [];
        snapshot.forEach((doc) => l.push(doc.data() as LegacyMember));
        setLegacyMembers(l);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'legacyMembers')
    );

    const unsubAchievementCards = onSnapshot(
      query(collection(db, 'achievementCards'), orderBy('updatedAt', 'asc')),
      (snapshot) => {
        const c: AchievementCard[] = [];
        snapshot.forEach((doc) => c.push(doc.data() as AchievementCard));
        setAchievementCards(c);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'achievementCards')
    );

    const unsubLandingConfig = onSnapshot(
      doc(db, 'settings', 'landingConfig'),
      (docSnap) => {
        if (docSnap.exists()) {
          setLandingConfig(docSnap.data() as LandingPageConfig);
        } else {
          setLandingConfig(null);
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'settings/landingConfig')
    );

    const unsubQuotes = onSnapshot(
      collection(db, 'managerQuotes'),
      (snapshot) => {
        const q: ManagerQuote[] = [];
        snapshot.forEach((doc) => q.push(doc.data() as ManagerQuote));
        setManagerQuotes(q);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'managerQuotes')
    );

    return () => {
      unsubRuns();
      unsubSugar();
      unsubConc();
      unsubDf();
      unsubExtLab();
      unsubCerts();
      unsubFinancialHistory();
      unsubPlantMetrics();
      unsubPlantConfig();
      unsubTeam();
      unsubLegacy();
      unsubAchievementCards();
      unsubLandingConfig();
      unsubQuotes();
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
    try {
      await deleteDoc(doc(db, 'certs', id));
      showToast('Certificate removed');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `certs/${id}`);
    }
  };

  const saveFinancialHistory = async (entry: FinancialHistoryEntry) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'financialHistory', entry.id), { ...entry, uid: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `financialHistory/${entry.id}`);
    }
  };

  const deleteFinancialHistory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'financialHistory', id));
      showToast('History entry deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `financialHistory/${id}`);
    }
  };

  const deleteExtLabEntry = async (id: string) => {
    if (!user) return;
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
    try {
      await setDoc(doc(db, 'settings', 'plantConfig'), { ...config, updatedAt: new Date().toISOString() });
      showToast('Plant configuration updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/plantConfig');
    }
  };

  const saveTeamMember = async (member: TeamMember) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'teamMembers', member.id), { ...member, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Team member saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teamMembers/${member.id}`);
    }
  };

  const deleteTeamMember = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'teamMembers', id));
      showToast('Team member deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teamMembers/${id}`);
    }
  };

  const saveLegacyMember = async (member: LegacyMember) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'legacyMembers', member.id), { ...member, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Legacy member saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `legacyMembers/${member.id}`);
    }
  };

  const deleteLegacyMember = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'legacyMembers', id));
      showToast('Legacy member deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `legacyMembers/${id}`);
    }
  };

  const saveManagerQuote = async (quote: ManagerQuote) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'managerQuotes', quote.id), { ...quote, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Manager quote updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `managerQuotes/${quote.id}`);
    }
  };

  const saveAchievementCard = async (card: AchievementCard) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'achievementCards', card.id), { ...card, uid: user.uid, updatedAt: new Date().toISOString() });
      showToast('Achievement card saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `achievementCards/${card.id}`);
    }
  };

  const deleteAchievementCard = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'achievementCards', id));
      showToast('Achievement card deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `achievementCards/${id}`);
    }
  };

  const saveLandingConfig = async (config: LandingPageConfig) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'settings', 'landingConfig'), { ...config, updatedAt: new Date().toISOString() });
      showToast('Landing page configuration saved');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/landingConfig');
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
      teamMembers, legacyMembers, managerQuotes, achievementCards, landingConfig,
      sidebarCollapsed, setSidebarCollapsed,
      isModalOpen, openModal, closeModal, editId, prefillLine,
      saveRun, deleteRun, toggleRunLock, saveSugarEntry, deleteSugarEntry,
      saveConcEntry, deleteConcEntry, saveDFEntry, deleteDFEntry,
      saveExtLabEntry, deleteExtLabEntry, saveCert, deleteCert, saveFinancialHistory, deleteFinancialHistory, savePlantMetrics, savePlantConfig, 
      saveTeamMember, deleteTeamMember, saveLegacyMember, deleteLegacyMember, saveManagerQuote,
      saveAchievementCard, deleteAchievementCard, saveLandingConfig,
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
