import React from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Scatter,
} from 'recharts';
import { CrashStep } from '../../types';
import { formatCurrency } from '../../utils';

interface Props {
  steps: CrashStep[];
  optimalDuration: number;
  normalDuration: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs font-mono space-y-1.5 border-cyan-400/20">
      <div className="font-bold neon-text mb-2">Duration: {label} days</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            {p.name}
          </span>
          <span style={{ color: p.color }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function CostChart({ steps, optimalDuration, normalDuration }: Props) {
  const data = steps.map(s => ({
    duration: s.projectDuration,
    'Direct Cost': Math.round(s.directCost),
    'Indirect Cost': Math.round(s.indirectCost),
    'Total Cost': Math.round(s.totalCost),
    isOptimal: s.projectDuration === optimalDuration,
  }));

  const optimalStep = steps.find(s => s.projectDuration === optimalDuration);
  const minCost = Math.min(...steps.map(s => s.totalCost));
  const maxCost = Math.max(...steps.map(s => s.totalCost));
  const padding = (maxCost - minCost) * 0.1;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-4 text-xs font-mono">
        <div className="glass-card px-3 py-2">
          <div className="text-slate-400 mb-0.5">Normal Duration</div>
          <div className="neon-text font-bold">{normalDuration} days</div>
        </div>
        <div className="glass-card px-3 py-2">
          <div className="text-slate-400 mb-0.5">Optimal Duration</div>
          <div className="font-bold" style={{ color: 'var(--neon-green)' }}>{optimalDuration} days</div>
        </div>
        {optimalStep && (
          <div className="glass-card px-3 py-2">
            <div className="text-slate-400 mb-0.5">Minimum Total Cost</div>
            <div className="font-bold" style={{ color: 'var(--neon-green)' }}>{formatCurrency(optimalStep.totalCost)}</div>
          </div>
        )}
        <div className="glass-card px-3 py-2">
          <div className="text-slate-400 mb-0.5">Duration Saved</div>
          <div className="font-bold" style={{ color: 'var(--neon-amber)' }}>{normalDuration - optimalDuration} days</div>
        </div>
      </div>

      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="directGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffb700" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ffb700" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,245,255,0.06)" />
            <XAxis
              dataKey="duration"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Fira Code' }}
              label={{ value: 'Project Duration (days)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              reversed
            />
            <YAxis
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Fira Code' }}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
              domain={[Math.max(0, minCost - padding), maxCost + padding]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'Fira Code', color: 'rgba(255,255,255,0.6)' }}
            />
            <ReferenceLine
              x={optimalDuration}
              stroke="rgba(57,255,20,0.7)"
              strokeDasharray="8 4"
              strokeWidth={2}
              label={{ value: '⭐ Optimal', fill: '#39ff14', fontSize: 11, fontFamily: 'Fira Code' }}
            />
            <Area type="monotone" dataKey="Total Cost" fill="url(#totalGrad)" stroke="transparent" />
            <Line type="monotone" dataKey="Direct Cost" stroke="#ffb700" strokeWidth={2} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="Indirect Cost" stroke="rgba(180,79,255,0.8)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="Total Cost" stroke="#00f5ff" strokeWidth={2.5} dot={false} />
            <Scatter
              dataKey="Total Cost"
              data={data.filter(d => d.isOptimal)}
              fill="#39ff14"
              shape={(props: any) => {
                const { cx, cy } = props;
                return <circle cx={cx} cy={cy} r={7} fill="#39ff14" stroke="rgba(57,255,20,0.4)" strokeWidth={6} />;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
