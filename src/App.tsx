/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { QCDashboard } from './components/QCDashboard';
import { YieldDashboard } from './components/YieldDashboard';
import { LineBoard } from './components/LineBoard';
import { Records } from './components/Records';
import { ChemistPerf } from './components/ChemistPerf';
import { LinePerf } from './components/LinePerf';
import { DataEntry } from './components/DataEntry';
import { Certs } from './components/Certs';
import { Settings } from './components/Settings';
import { useAppContext } from './store';
import { DataEntryModal } from './components/DataEntryModal';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { currentView, toastMsg, user, isAuthReady, signIn } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center font-sans" style={{ backgroundColor: '#0a1628', color: '#dce8ff' }}>
        <div className="animate-pulse" style={{ color: '#00e5ff' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center font-sans" style={{ backgroundColor: '#0a1628', color: '#dce8ff' }}>
        <div className="p-8 rounded-xl shadow-xl max-w-sm w-full text-center" style={{ backgroundColor: '#132244', border: '1px solid #1a3060' }}>
          <div className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center font-condensed font-extrabold text-2xl text-white mb-4" style={{ backgroundColor: '#1565c0' }}>TBL</div>
          <h1 className="text-xl font-bold mb-2">Transcom Beverages</h1>
          <p className="text-sm mb-6" style={{ color: '#6a8fc0' }}>Quality Control & Yield System</p>
          
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              await signIn(username, password);
              setLoading(false);
            }}
            className="flex flex-col gap-3 text-left"
          >
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: '#6a8fc0' }}>Username</label>
              <input 
                type="text" 
                className="finp w-full" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: '#6a8fc0' }}>Password</label>
              <input 
                type="password" 
                className="finp w-full" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full font-bold py-2.5 rounded hover:bg-white transition-colors mt-2 disabled:opacity-50"
              style={{ backgroundColor: '#00e5ff', color: '#0a1628' }}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div className="mt-4 text-[10px] text-center" style={{ color: '#3a5a8a' }}>
              Admin: admin / 1234 <br/>
              Chemist: chemist / chemist123
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ backgroundColor: '#0a1628', color: '#dce8ff' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto relative">
          {currentView === 'qc' && <QCDashboard />}
          {currentView === 'yield' && <YieldDashboard />}
          {currentView === 'lineboard' && <LineBoard />}
          {currentView === 'records' && <Records />}
          {currentView === 'chemist' && <ChemistPerf />}
          {currentView === 'line' && <LinePerf />}
          {currentView === 'dataEntry' && <DataEntry />}
          {currentView === 'certs' && <Certs />}
          {currentView === 'settings' && <Settings />}
        </main>
      </div>
      <DataEntryModal />
      {toastMsg && (
        <div className="fixed bottom-5 right-5 text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-bounce" style={{ backgroundColor: '#00e5ff' }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}

import { AppProvider } from './store';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
