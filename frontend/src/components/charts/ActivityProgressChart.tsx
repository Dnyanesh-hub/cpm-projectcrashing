import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ActivityNode } from '../../types';
import { formatCurrency } from '../../utils';

interface Props { activities: ActivityNode[]; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass-card p-3 text-xs font-mono space-y-1">
      <div className="font-bold neon-text mb-1">{label} — {d.name}</div>
      <div>Normal: <span className="text-slate-200">{d.normalDuration}d</span></div>
      <div>Current: <span className="text-amber-400">{d.currentDuration}d</span></div>
      <div>Crashed by: <span className="text-red-400">{d.crashed}d</span></div>
      <div>Remaining: <span className="text-green-400">{d.maxCrash - d.crashed}d available</span></div>
      <div>Cost: <span className="neon-text">{formatCurrency(d.currentCost)}</span></div>
      {d.isCritical && <div className="text-red-400 font-bold mt-1">⚠ On Critical Path</div>}
    </div>
  );
};

export function ActivityProgressChart({ activities }: Props) {
  const data = activities.map(a => ({
    id: a.id, name: a.name,
    normalDuration: a.normalDuration, currentDuration: a.currentDuration,
    crashed: a.normalDuration - a.currentDuration,
    maxCrash: a.normalDuration - a.crashDuration,
    isCritical: a.isCritical, currentCost: a.currentCost, crashSlope: a.crashSlope,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-mono text-xs text-slate-400 uppercase tracking-wider mb-3">Activity Duration vs Crash</h4>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,245,255,0.06)" />
              <XAxis dataKey="id" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Fira Code' }} stroke="rgba(255,255,255,0.1)" />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Fira Code' }} stroke="rgba(255,255,255,0.1)"
                label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="currentDuration" name="Current Duration" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {data.map((d, i) => (
                  <Cell key={i}
                    fill={d.isCritical ? 'rgba(255,56,96,0.7)' : 'rgba(0,245,255,0.5)'}
                    stroke={d.isCritical ? '#ff3860' : 'rgba(0,245,255,0.8)'} strokeWidth={1} />
                ))}
              </Bar>
              <Bar dataKey="crashed" name="Time Crashed" radius={[4, 4, 0, 0]} maxBarSize={40}
                fill="rgba(255,183,0,0.5)" stroke="rgba(255,183,0,0.8)" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h4 className="font-mono text-xs text-slate-400 uppercase tracking-wider mb-3">Crash Capacity Used</h4>
        <div className="space-y-2.5">
          {data.map(a => {
            const pct = a.maxCrash > 0 ? (a.crashed / a.maxCrash) * 100 : 0;
            const full = a.crashed >= a.maxCrash;
            return (
              <div key={a.id} className="flex items-center gap-3">
                <div className="w-8 font-mono text-xs font-bold shrink-0" style={{ color: a.isCritical ? '#ff3860' : '#00f5ff' }}>{a.id}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>{a.name.length > 22 ? a.name.substring(0, 21) + '…' : a.name}</span>
                    <span>{a.crashed}/{a.maxCrash}d</span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        background: full ? 'linear-gradient(90deg, #ff3860, #ff6b6b)'
                          : a.isCritical ? 'linear-gradient(90deg, rgba(255,56,96,0.8), rgba(255,183,0,0.8))'
                          : 'linear-gradient(90deg, rgba(0,245,255,0.7), rgba(57,255,20,0.5))',
                      }} />
                  </div>
                </div>
                <div className="w-10 text-right shrink-0">
                  {full ? <span className="text-[10px] font-mono text-red-400">MAX</span>
                    : <span className="text-[10px] font-mono text-slate-500">{Math.round(pct)}%</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
