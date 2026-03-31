import React from 'react';
import { CrashStep } from '../../types';
import { formatCurrency, cn } from '../../utils';
import { exportResultsToCSV } from '../../utils';
import { Download, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface Props {
  steps: CrashStep[];
  currentStep: number;
  onStepSelect: (step: number) => void;
  optimalDuration: number;
}

export function CrashTable({ steps, currentStep, onStepSelect, optimalDuration }: Props) {
  const handleExport = () => {
    exportResultsToCSV(steps, 'crash-simulation.csv');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-200">Crash Simulation Steps</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{steps.length} iterations</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2 text-xs">
          <Download size={12} /> Export CSV
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10" style={{ background: 'rgba(15,22,40,0.95)', backdropFilter: 'blur(8px)' }}>
              <tr className="border-b border-white/10">
                {['Step', 'Duration', 'Crashed Activity', 'Direct Cost', 'Indirect Cost', 'Total Cost', 'Δ Cost', 'Critical Path'].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {steps.map((s, i) => {
                const isSelected = s.step === currentStep;
                const isOptimal = s.projectDuration === optimalDuration;
                const costTrend = s.incrementalCost;

                return (
                  <tr
                    key={s.step}
                    onClick={() => onStepSelect(s.step)}
                    className={cn(
                      'border-b border-white/5 cursor-pointer transition-all duration-150',
                      isSelected ? 'bg-cyan-500/10' : i % 2 === 0 ? 'bg-white/[0.01]' : '',
                      'hover:bg-white/[0.04]'
                    )}
                    style={isSelected ? { borderLeft: '2px solid #00f5ff' } : {}}
                  >
                    <td className="px-3 py-2.5 font-mono font-bold text-slate-300">
                      <div className="flex items-center gap-2">
                        {s.step}
                        {isOptimal && <span className="badge-optimal text-[10px]">★ Optimal</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      <span className={cn('font-bold', isOptimal ? 'text-green-400' : 'text-slate-200')}>
                        {s.projectDuration}d
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {s.crashedActivity ? (
                        <span className="text-amber-400 font-bold">{s.crashedActivity}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-300">{formatCurrency(s.directCost)}</td>
                    <td className="px-3 py-2.5 font-mono text-purple-400">{formatCurrency(s.indirectCost)}</td>
                    <td className="px-3 py-2.5 font-mono font-bold">
                      <span className={isOptimal ? 'text-green-400' : 'neon-text'}>{formatCurrency(s.totalCost)}</span>
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {s.step === 0 ? (
                        <span className="text-slate-500">—</span>
                      ) : costTrend < 0 ? (
                        <span className="text-green-400 flex items-center gap-1">
                          <TrendingDown size={10} />{formatCurrency(costTrend)}
                        </span>
                      ) : costTrend > 0 ? (
                        <span className="text-red-400 flex items-center gap-1">
                          <TrendingUp size={10} />+{formatCurrency(costTrend)}
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1"><Minus size={10} />$0</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-400 text-[10px]">
                      {s.criticalPath.join(' → ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
