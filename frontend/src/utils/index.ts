import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Activity, ActivityNode } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDuration(days: number): string {
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function validateActivities(activities: Activity[]): string[] {
  const errors: string[] = [];
  const ids = new Set(activities.map((a) => a.id));

  activities.forEach((a) => {
    if (!a.id) errors.push('All activities must have an ID');
    if (a.crashDuration > a.normalDuration)
      errors.push(`Activity ${a.id}: crash duration must be ≤ normal duration`);
    if (a.crashCost < a.normalCost)
      errors.push(`Activity ${a.id}: crash cost must be ≥ normal cost`);
    a.predecessors.forEach((p) => {
      if (!ids.has(p))
        errors.push(`Activity ${a.id}: predecessor "${p}" does not exist`);
    });
  });

  return errors;
}

export function computeCrashSlope(activity: Activity): number {
  const timeSaved = activity.normalDuration - activity.crashDuration;
  if (timeSaved <= 0) return Infinity;
  return (activity.crashCost - activity.normalCost) / timeSaved;
}

export function exportToCSV(activities: ActivityNode[], filename: string): void {
  const headers = [
    'ID', 'Name', 'Normal Duration', 'Crash Duration', 'Normal Cost', 'Crash Cost',
    'ES', 'EF', 'LS', 'LF', 'Slack', 'Critical', 'Current Duration', 'Current Cost', 'Crash Slope'
  ];

  const rows = activities.map((a) => [
    a.id, a.name, a.normalDuration, a.crashDuration, a.normalCost, a.crashCost,
    a.es, a.ef, a.ls, a.lf, a.slack, a.isCritical ? 'Yes' : 'No',
    a.currentDuration, a.currentCost.toFixed(2), a.crashSlope === Infinity ? 'N/A' : a.crashSlope.toFixed(2)
  ]);

  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  downloadFile(csv, filename, 'text/csv');
}

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportResultsToCSV(steps: any[], filename: string): void {
  const headers = ['Step', 'Duration (days)', 'Direct Cost', 'Indirect Cost', 'Total Cost', 'Crashed Activity', 'Critical Path'];
  const rows = steps.map((s) => [
    s.step,
    s.projectDuration,
    s.directCost.toFixed(2),
    s.indirectCost.toFixed(2),
    s.totalCost.toFixed(2),
    s.crashedActivity || 'None',
    s.criticalPath.join(' → '),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  downloadFile(csv, filename, 'text/csv');
}
