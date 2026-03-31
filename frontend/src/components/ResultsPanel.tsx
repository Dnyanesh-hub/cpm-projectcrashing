import React from 'react';

// ✅ FIXED IMPORTS
import { useStore } from '../store';

import { NetworkGraph } from './graph/NetworkGraph';
import { CostChart } from './charts/CostChart';
import { CrashTable } from './charts/CrashTable';
import { ActivityProgressChart } from './charts/ActivityProgressChart';

import { formatCurrency, exportToCSV } from '../utils';

import { Download } from 'lucide-react';

const tabs = [
  { id: 'network', label: '⬡ Network' },
  { id: 'cost', label: '📈 Cost Analysis' },
  { id: 'steps', label: '⚙ Crash Steps' },
  { id: 'activity', label: '📊 Activity View' },
];

export function ResultsPanel() {
  const { optimizationResult, currentStep, setCurrentStep } = useStore();
  const [activeSubTab, setActiveSubTab] = React.useState('network');

  if (!optimizationResult) return null;

  const {
    steps,
    optimalDuration,
    normalDuration,
    normalTotalCost,
    optimalTotalCost,
    crashDuration,
    crashTotalCost
  } = optimizationResult;

  const step = steps[currentStep] ?? steps[0];
  const savings = normalTotalCost - optimalTotalCost;
  const savingsPct = ((savings / normalTotalCost) * 100).toFixed(1);

  const handleExportActivities = () => {
    exportToCSV(step.activities, `cpm-activities-step${currentStep}.csv`);
  };

  return (
    <div className="space-y-5 animate-fade-in">

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="metric-card">
          <span className="text-xs text-slate-500 uppercase">Normal Duration</span>
          <span className="text-xl font-bold">{normalDuration}d</span>
          <span className="text-xs">{formatCurrency(normalTotalCost)}</span>
        </div>

        <div className="metric-card">
          <span className="text-xs text-slate-500 uppercase">Optimal Duration</span>
          <span className="text-xl font-bold text-green-400">{optimalDuration}d</span>
          <span className="text-xs text-green-400">{formatCurrency(optimalTotalCost)}</span>
        </div>

        <div className="metric-card">
          <span className="text-xs text-slate-500 uppercase">Savings</span>
          <span className="text-xl font-bold text-yellow-400">{formatCurrency(savings)}</span>
          <span className="text-xs text-yellow-400">{savingsPct}%</span>
        </div>

        <div className="metric-card">
          <span className="text-xs text-slate-500 uppercase">Crash Duration</span>
          <span className="text-xl font-bold text-red-400">{crashDuration}d</span>
          <span className="text-xs">{formatCurrency(crashTotalCost)}</span>
        </div>
      </div>

      {/* SLIDER */}
      <div className="p-4 border rounded">
        <div className="flex justify-between mb-2">
          <span>Step {currentStep}</span>
          <span>{step.projectDuration}d | {formatCurrency(step.totalCost)}</span>
        </div>

        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id)}
            className={`px-3 py-1 border rounded ${
              activeSubTab === t.id ? 'bg-black text-white' : ''
            }`}
          >
            {t.label}
          </button>
        ))}

        <button onClick={handleExportActivities} className="ml-auto flex items-center gap-1 text-sm border px-3 py-1 rounded">
          <Download size={14} /> Export
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-4 border rounded">

        {activeSubTab === 'network' && (
          <>
            <p>Critical Path: {step.criticalPath.join(' → ')}</p>

            <NetworkGraph
              activities={step.activities}
              criticalPath={step.criticalPath}
              height={400}
            />
          </>
        )}

        {activeSubTab === 'cost' && (
          <CostChart
            steps={steps}
            optimalDuration={optimalDuration}
            normalDuration={normalDuration}
          />
        )}

        {activeSubTab === 'steps' && (
          <CrashTable
            steps={steps}
            currentStep={currentStep}
            onStepSelect={setCurrentStep}
            optimalDuration={optimalDuration}
          />
        )}

        {activeSubTab === 'activity' && (
          <ActivityProgressChart activities={step.activities} />
        )}

      </div>

      {/* TABLE */}
      {activeSubTab === 'network' && (
        <div className="border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['ID','Name','Dur','Cost','ES','EF','LS','LF','Slack'].map(h => (
                  <th key={h} className="p-2 border">{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {step.activities.map(a => (
                <tr key={a.id}>
                  <td className="p-2">{a.id}</td>
                  <td className="p-2">{a.name}</td>
                  <td className="p-2">{a.currentDuration}</td>
                  <td className="p-2">{formatCurrency(a.currentCost)}</td>
                  <td className="p-2">{a.es}</td>
                  <td className="p-2">{a.ef}</td>
                  <td className="p-2">{a.ls}</td>
                  <td className="p-2">{a.lf}</td>
                  <td className="p-2">{a.slack}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}