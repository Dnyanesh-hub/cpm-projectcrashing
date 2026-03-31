import { CPMEngine } from '../src/services/cpmEngine';
import { CrashingEngine } from '../src/services/crashingEngine';
import { Activity } from '../src/types';

const sampleActivities: Activity[] = [
  { id: 'A', name: 'A', normalDuration: 4, crashDuration: 2, normalCost: 1000, crashCost: 1800, predecessors: [] },
  { id: 'B', name: 'B', normalDuration: 3, crashDuration: 2, normalCost: 800, crashCost: 1100, predecessors: ['A'] },
  { id: 'C', name: 'C', normalDuration: 5, crashDuration: 3, normalCost: 1500, crashCost: 2100, predecessors: ['A'] },
  { id: 'D', name: 'D', normalDuration: 2, crashDuration: 1, normalCost: 500, crashCost: 800, predecessors: ['B', 'C'] },
];

describe('CPMEngine', () => {
  test('detects cycles', () => {
    const cyclic: Activity[] = [
      { id: 'A', name: 'A', normalDuration: 1, crashDuration: 1, normalCost: 100, crashCost: 100, predecessors: ['B'] },
      { id: 'B', name: 'B', normalDuration: 1, crashDuration: 1, normalCost: 100, crashCost: 100, predecessors: ['A'] },
    ];
    expect(CPMEngine.detectCycles(cyclic)).toBe(true);
  });

  test('no cycle on valid DAG', () => {
    expect(CPMEngine.detectCycles(sampleActivities)).toBe(false);
  });

  test('calculates correct project duration', () => {
    const result = CPMEngine.calculate(sampleActivities);
    // A(4) -> C(5) -> D(2) = 11
    expect(result.projectDuration).toBe(11);
  });

  test('identifies correct critical path', () => {
    const result = CPMEngine.calculate(sampleActivities);
    // A -> C -> D is the longest path
    expect(result.criticalPath).toContain('A');
    expect(result.criticalPath).toContain('C');
    expect(result.criticalPath).toContain('D');
  });

  test('ES/EF calculations are correct', () => {
    const result = CPMEngine.calculate(sampleActivities);
    const map = new Map(result.activities.map(a => [a.id, a]));
    expect(map.get('A')!.es).toBe(0);
    expect(map.get('A')!.ef).toBe(4);
    expect(map.get('C')!.es).toBe(4);
    expect(map.get('C')!.ef).toBe(9);
    expect(map.get('D')!.es).toBe(9);
  });

  test('throws on unknown predecessor', () => {
    const bad: Activity[] = [
      { id: 'A', name: 'A', normalDuration: 1, crashDuration: 1, normalCost: 100, crashCost: 100, predecessors: ['X'] },
    ];
    expect(() => CPMEngine.calculate(bad)).toThrow();
  });
});

describe('CrashingEngine', () => {
  test('runs optimization without error', () => {
    const result = CrashingEngine.optimize({
      activities: sampleActivities,
      indirectCostPerDay: 300,
    });
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.normalDuration).toBe(11);
  });

  test('optimal cost <= normal cost', () => {
    const result = CrashingEngine.optimize({
      activities: sampleActivities,
      indirectCostPerDay: 300,
    });
    expect(result.optimalTotalCost).toBeLessThanOrEqual(result.normalTotalCost);
  });

  test('optimal duration <= normal duration', () => {
    const result = CrashingEngine.optimize({
      activities: sampleActivities,
      indirectCostPerDay: 300,
    });
    expect(result.optimalDuration).toBeLessThanOrEqual(result.normalDuration);
  });

  test('throws on invalid crash duration', () => {
    const bad: Activity[] = [
      { id: 'A', name: 'A', normalDuration: 2, crashDuration: 5, normalCost: 100, crashCost: 200, predecessors: [] },
    ];
    expect(() => CrashingEngine.optimize({ activities: bad, indirectCostPerDay: 100 })).toThrow();
  });
});
