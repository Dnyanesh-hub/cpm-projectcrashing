import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle, Download, Upload, FlaskConical } from 'lucide-react';
import { useStore } from '../../store';
import { Activity } from '../../types';
import { generateId, validateActivities, cn } from '../../utils';

const emptyActivity = (): Activity => ({
  id: '',
  name: '',
  normalDuration: 0,
  crashDuration: 0,
  normalCost: 0,
  crashCost: 0,
  predecessors: [],
});

export function ActivityForm() {
  const {
    activities, indirectCostPerDay,
    addActivity, removeActivity,
    setIndirectCost, runOptimization, loadSample, isLoading, error, clearError,
    setActivities,
  } = useStore();

  const [newActivity, setNewActivity] = useState<Activity>(emptyActivity());
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [predInput, setPredInput] = useState('');

  const handleAdd = () => {
    const errors: string[] = [];
    if (!newActivity.id.trim()) errors.push('Activity ID is required');
    if (!newActivity.name.trim()) errors.push('Activity name is required');
    if (newActivity.normalDuration <= 0) errors.push('Normal duration must be > 0');
    if (newActivity.crashDuration > newActivity.normalDuration) errors.push('Crash duration must be ≤ normal duration');
    if (newActivity.crashCost < newActivity.normalCost) errors.push('Crash cost must be ≥ normal cost');
    if (activities.find(a => a.id === newActivity.id.trim().toUpperCase())) errors.push(`ID "${newActivity.id}" already exists`);

    if (errors.length > 0) { setFormErrors(errors); return; }
    setFormErrors([]);

    const preds = predInput
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    addActivity({ ...newActivity, id: newActivity.id.trim().toUpperCase(), predecessors: preds });
    setNewActivity(emptyActivity());
    setPredInput('');
  };

  const handleRunValidate = () => {
    const errs = validateActivities(activities);
    if (errs.length > 0) { setFormErrors(errs); return; }
    setFormErrors([]);
    runOptimization();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.activities) {
          setActivities(data.activities);
          if (data.indirectCostPerDay) setIndirectCost(data.indirectCostPerDay);
        }
      } catch { setFormErrors(['Invalid JSON file']); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportJSON = () => {
    const data = JSON.stringify({ activities, indirectCostPerDay }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'project.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold neon-text">Project Activities</h2>
          <p className="text-sm text-slate-400 mt-0.5">{activities.length} activit{activities.length !== 1 ? 'ies' : 'y'} defined</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={loadSample} disabled={isLoading} className="btn-primary flex items-center gap-2">
            <FlaskConical size={14} /> Sample Data
          </button>
          <button onClick={handleExportJSON} className="btn-primary flex items-center gap-2">
            <Download size={14} /> Export
          </button>
          <label className="btn-primary flex items-center gap-2 cursor-pointer">
            <Upload size={14} /> Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {/* Indirect Cost */}
      <div className="glass-card p-4">
        <label className="block text-sm font-mono text-slate-300 mb-2">
          Indirect Cost per Day <span className="text-slate-500">(overhead / fixed cost)</span>
        </label>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-lg">$</span>
          <input
            type="number" min={0}
            value={indirectCostPerDay || ''}
            onChange={e => setIndirectCost(Number(e.target.value))}
            className="input-field max-w-xs"
            placeholder="1000"
          />
          <span className="text-slate-500 text-sm">/ day</span>
        </div>
      </div>

      {/* Add Activity Form */}
      <div className="glass-card p-5">
        <h3 className="font-display text-xs text-slate-400 mb-4 uppercase tracking-widest">Add New Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">ID *</label>
            <input
              value={newActivity.id}
              onChange={e => setNewActivity(p => ({ ...p, id: e.target.value.toUpperCase() }))}
              onKeyDown={handleKeyDown}
              className="input-field"
              placeholder="A"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">Name *</label>
            <input
              value={newActivity.name}
              onChange={e => setNewActivity(p => ({ ...p, name: e.target.value }))}
              onKeyDown={handleKeyDown}
              className="input-field"
              placeholder="Site Preparation"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">Predecessors</label>
            <input
              value={predInput}
              onChange={e => setPredInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              className="input-field"
              placeholder="A, B"
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleAdd} className="btn-primary flex items-center gap-2 w-full justify-center">
              <Plus size={14} /> Add
            </button>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">Normal Duration (days)</label>
            <input type="number" min={1}
              value={newActivity.normalDuration || ''}
              onChange={e => setNewActivity(p => ({ ...p, normalDuration: Number(e.target.value) }))}
              onKeyDown={handleKeyDown}
              className="input-field" placeholder="10" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">Crash Duration (days)</label>
            <input type="number" min={0}
              value={newActivity.crashDuration || ''}
              onChange={e => setNewActivity(p => ({ ...p, crashDuration: Number(e.target.value) }))}
              onKeyDown={handleKeyDown}
              className="input-field" placeholder="7" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">Normal Cost ($)</label>
            <input type="number" min={0}
              value={newActivity.normalCost || ''}
              onChange={e => setNewActivity(p => ({ ...p, normalCost: Number(e.target.value) }))}
              onKeyDown={handleKeyDown}
              className="input-field" placeholder="5000" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-mono">Crash Cost ($)</label>
            <input type="number" min={0}
              value={newActivity.crashCost || ''}
              onChange={e => setNewActivity(p => ({ ...p, crashCost: Number(e.target.value) }))}
              onKeyDown={handleKeyDown}
              className="input-field" placeholder="8000" />
          </div>
        </div>
      </div>

      {/* Errors */}
      {(formErrors.length > 0 || error) && (
        <div className="glass-card p-4 animate-slide-in" style={{ borderColor: 'rgba(255,56,96,0.3)' }}>
          <div className="flex items-start gap-2 text-red-400">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div className="space-y-1">
              {formErrors.map((e, i) => <p key={i} className="text-sm font-mono">{e}</p>)}
              {error && <p className="text-sm font-mono">{error}</p>}
            </div>
          </div>
          <button onClick={() => { setFormErrors([]); clearError(); }}
            className="text-xs text-slate-500 mt-2 hover:text-slate-300 transition-colors">
            Dismiss
          </button>
        </div>
      )}

      {/* Activities Table */}
      {activities.length > 0 && (
        <div className="glass-card overflow-hidden animate-slide-in">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">Activity Schedule</span>
            <span className="badge-normal">{activities.length} activities</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['ID', 'Name', 'Predecessors', 'Norm.Dur', 'Crash.Dur', 'Norm.Cost', 'Crash.Cost', 'Cost Slope', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activities.map((a, i) => {
                  const maxCrash = a.normalDuration - a.crashDuration;
                  const slope = maxCrash > 0 ? `$${((a.crashCost - a.normalCost) / maxCrash).toFixed(0)}/day` : '∞';
                  return (
                    <tr key={a.id} className={cn(
                      'border-b border-white/5 transition-colors hover:bg-white/[0.03]',
                      i % 2 === 0 ? 'bg-white/[0.01]' : '',
                    )}>
                      <td className="px-4 py-3 font-mono font-bold neon-text">{a.id}</td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{a.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {a.predecessors.length > 0 ? a.predecessors.join(', ') : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300 text-center">{a.normalDuration}</td>
                      <td className="px-4 py-3 font-mono text-slate-300 text-center">{a.crashDuration}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">${a.normalCost.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">${a.crashCost.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: 'var(--neon-amber)' }}>{slope}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => removeActivity(a.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Run Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleRunValidate}
          disabled={isLoading || activities.length === 0}
          className="btn-success flex items-center gap-2 text-base px-8 py-3"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>⚡ Run CPM + Optimization</>
          )}
        </button>
      </div>
    </div>
  );
}
