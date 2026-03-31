import React from 'react';
import { Sun, Moon, RotateCcw, Github } from 'lucide-react';
import { useStore } from '../store';

export function Header() {
  const { theme, setTheme, resetProject, optimizationResult } = useStore();

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: 'rgba(0,245,255,0.1)', background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center neon-glow" style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.4)' }}>
            <span className="font-display text-sm font-bold neon-text">⬡</span>
          </div>
          <div>
            <h1 className="font-display text-base font-bold leading-none">
              <span className="neon-text">CPM</span>
              <span className="text-slate-300"> Optimizer</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Project Time-Cost Analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {optimizationResult && (
            <div className="hidden md:flex items-center gap-2 mr-2">
              <span className="badge-optimal text-[10px]">
                ★ Optimized
              </span>
            </div>
          )}
          <button
            onClick={resetProject}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            title="Reset project"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
