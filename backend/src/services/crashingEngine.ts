import { Activity, CrashStep, OptimizationResult, ProjectInput } from '../types';
import { CPMEngine } from './cpmEngine';

export class CrashingEngine {

  static optimize(input: ProjectInput): OptimizationResult {
    const { activities, indirectCostPerDay } = input;

    const durations = new Map<string, number>();
    activities.forEach(a => durations.set(a.id, a.normalDuration));

    const steps: CrashStep[] = [];

    let result = CPMEngine.calculate(activities, durations);
    let costs = this.computeCosts(result, activities, durations, indirectCostPerDay);

    steps.push(this.buildStep(0, result, costs, null, 0));

    let prevCost = costs.totalCost;
    let step = 1;

    while (true) {
      result = CPMEngine.calculate(activities, durations);

      const paths = result.allCriticalPaths;
      const critical = result.activities.filter(a =>
        a.isCritical && a.remainingCrashTime > 0
      );

      if (!critical.length) break;

      const combos: { acts: any[], cost: number }[] = [];

      function gen(i: number, chosen: any[]) {
        if (i === paths.length) {
          const ok = paths.every(p =>
            p.some(id => chosen.find(a => a.id === id))
          );
          if (ok) {
            combos.push({
              acts: [...chosen],
              cost: chosen.reduce((s, a) => s + a.crashSlope, 0)
            });
          }
          return;
        }

        for (const id of paths[i]) {
          const a = critical.find(x => x.id === id);
          if (a && !chosen.includes(a)) {
            chosen.push(a);
            gen(i + 1, chosen);
            chosen.pop();
          }
        }
      }

      gen(0, []);

      if (!combos.length) break;

      combos.sort((a, b) => a.cost - b.cost);
      const best = combos[0].acts;

      const prev = new Map(durations);
      best.forEach(a => durations.set(a.id, durations.get(a.id)! - 1));

      const newRes = CPMEngine.calculate(activities, durations);
      if (newRes.projectDuration >= result.projectDuration) {
        durations.clear();
        prev.forEach((v, k) => durations.set(k, v));
        break;
      }

      costs = this.computeCosts(newRes, activities, durations, indirectCostPerDay);

      steps.push(this.buildStep(
        step,
        newRes,
        costs,
        best.map(a => a.id).join(","),
        costs.totalCost - prevCost
      ));

      prevCost = costs.totalCost;
      step++;
    }

    return this.finalize(steps);
  }

  static computeCosts(res: any, acts: Activity[], durs: Map<string, number>, ic: number) {
    let direct = 0;

    for (const a of acts) {
      const d = durs.get(a.id)!;
      const crash = a.normalDuration - d;
      const slope = (a.crashCost - a.normalCost) / (a.normalDuration - a.crashDuration || 1);
      direct += a.normalCost + slope * crash;
    }

    const indirect = res.projectDuration * ic;

    return {
      directCost: Math.round(direct),
      indirectCost: indirect,
      totalCost: Math.round(direct + indirect)
    };
  }

  static buildStep(step: number, res: any, costs: any, act: string | null, inc: number): CrashStep {
    return {
      step,
      projectDuration: res.projectDuration,
      directCost: costs.directCost,
      indirectCost: costs.indirectCost,
      totalCost: costs.totalCost,
      criticalPath: res.criticalPath,
      crashedActivity: act,
      crashAmount: 1,
      activities: res.activities,
      incrementalCost: inc
    };
  }

  static finalize(steps: CrashStep[]): OptimizationResult {
    const best = steps.reduce((a, b) => a.totalCost < b.totalCost ? a : b);

    return {
      steps,
      optimalDuration: best.projectDuration,
      optimalTotalCost: best.totalCost,
      normalDuration: steps[0].projectDuration,
      normalTotalCost: steps[0].totalCost,
      crashDuration: steps[steps.length - 1].projectDuration,
      crashTotalCost: steps[steps.length - 1].totalCost
    };
  }
}