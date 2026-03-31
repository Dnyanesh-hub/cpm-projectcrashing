import React, { useEffect } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { ActivityForm } from './components/forms/ActivityForm';
import { ResultsPanel } from './components/ResultsPanel';

const mainTabs = [
  { id: 'input', label: '01 / Input' },
  { id: 'network', label: '02 / Analysis' },
];

function App() {
  const { theme, activeTab, setActiveTab, optimizationResult } = useStore();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <div className={`min-h-screen ${theme}`}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {mainTabs.map(t => (
            <button
              key={t.id}
              onClick={() => { if (t.id === 'network' && !optimizationResult) return; setActiveTab(t.id); }}
              disabled={t.id === 'network' && !optimizationResult}
              className={`px-5 py-2.5 rounded-lg font-mono text-sm transition-all duration-200 ${
                activeTab === t.id ? 'tab-active'
                : t.id === 'network' && !optimizationResult ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
              {t.id === 'network' && !optimizationResult && <span className="ml-2 text-[10px] opacity-50">Run first</span>}
            </button>
          ))}
        </div>
        {activeTab === 'input' && <ActivityForm />}
        {activeTab === 'network' && optimizationResult && <ResultsPanel />}
      </main>
      <footer className="border-t mt-16 py-6" style={{ borderColor: 'rgba(0,245,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between text-xs font-mono text-slate-600">
          <span>CPM Optimizer — Project Time-Cost Analysis</span>
          <span>Critical Path Method + Activity Crashing Engine</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
