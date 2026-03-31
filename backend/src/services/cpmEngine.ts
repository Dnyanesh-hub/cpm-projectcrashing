import { Activity, ActivityNode, NetworkResult } from '../types';

export class CPMEngine {

  // =========================
  // 🔍 CYCLE DETECTION
  // =========================
  static detectCycles(activities: Activity[]): boolean {
    const graph = new Map<string, string[]>();
    activities.forEach(a => graph.set(a.id, a.predecessors || []));

    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map<string, number>();
    activities.forEach(a => color.set(a.id, WHITE));

    const dfs = (node: string): boolean => {
      color.set(node, GRAY);
      for (const n of graph.get(node) || []) {
        if (!color.has(n)) continue;
        if (color.get(n) === GRAY) return true;
        if (color.get(n) === WHITE && dfs(n)) return true;
      }
      color.set(node, BLACK);
      return false;
    };

    for (const a of activities) {
      if (color.get(a.id) === WHITE && dfs(a.id)) return true;
    }

    return false;
  }

  // =========================
  // 🔢 TOPO SORT
  // =========================
  static topologicalSort(activities: Activity[]): string[] {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();

    activities.forEach(a => {
      inDegree.set(a.id, 0);
      graph.set(a.id, []);
    });

    activities.forEach(a => {
      (a.predecessors || []).forEach(p => {
        graph.get(p)?.push(a.id);
        inDegree.set(a.id, (inDegree.get(a.id) || 0) + 1);
      });
    });

    const queue: string[] = [];
    inDegree.forEach((d, id) => {
      if (d === 0) queue.push(id);
    });

    const res: string[] = [];

    while (queue.length) {
      const node = queue.shift()!;
      res.push(node);

      for (const n of graph.get(node) || []) {
        inDegree.set(n, inDegree.get(n)! - 1);
        if (inDegree.get(n) === 0) queue.push(n);
      }
    }

    return res;
  }

  // =========================
  // ▶ FORWARD PASS
  // =========================
  static forwardPass(nodes: ActivityNode[], order: string[]) {
    const map = new Map(nodes.map(n => [n.id, n]));

    order.forEach(id => {
      const n = map.get(id)!;
      n.es = Math.max(
        0,
        ...(n.predecessors || []).map(p => map.get(p)?.ef || 0)
      );
      n.ef = n.es + n.currentDuration;
    });
  }

  // =========================
  // ◀ BACKWARD PASS
  // =========================
  static backwardPass(nodes: ActivityNode[], order: string[], duration: number) {
    const map = new Map(nodes.map(n => [n.id, n]));
    const succ = new Map<string, string[]>();

    nodes.forEach(n => succ.set(n.id, []));
    nodes.forEach(n => {
      (n.predecessors || []).forEach(p => succ.get(p)?.push(n.id));
    });

    [...order].reverse().forEach(id => {
      const n = map.get(id)!;
      const s = succ.get(id)!;

      n.lf = s.length ? Math.min(...s.map(x => map.get(x)!.ls)) : duration;
      n.ls = n.lf - n.currentDuration;
    });
  }

  // =========================
  // 🔥 FIND ALL CRITICAL PATHS (FIXED POSITION)
  // =========================
  static findAllCriticalPaths(nodes: ActivityNode[], projectDuration: number): string[][] {
    const paths: string[][] = [];

    function dfs(curr: ActivityNode, path: string[]) {
      path.push(curr.id);

      if (curr.ef === projectDuration) {
        paths.push([...path]);
      } else {
        for (const next of nodes) {
          if (
            next.predecessors.includes(curr.id) &&
            next.isCritical &&
            next.es === curr.ef
          ) {
            dfs(next, path);
          }
        }
      }

      path.pop();
    }

    nodes.forEach(n => {
      if (n.isCritical && n.es === 0) {
        dfs(n, []);
      }
    });

    return paths;
  }

  // =========================
  // 🚀 MAIN CPM
  // =========================
  static calculate(
    activities: Activity[],
    overrideDurations?: Map<string, number>
  ): NetworkResult {

    if (this.detectCycles(activities)) {
      throw new Error('Cyclic dependency detected');
    }

    const order = this.topologicalSort(activities);

    const nodes: ActivityNode[] = activities.map(a => {
      const d = overrideDurations?.get(a.id) ?? a.normalDuration;
      const maxCrash = a.normalDuration - a.crashDuration;
      const slope = maxCrash > 0
        ? (a.crashCost - a.normalCost) / maxCrash
        : Infinity;

      const crashed = a.normalDuration - d;

      return {
        ...a,
        es: 0, ef: 0, ls: 0, lf: 0,
        slack: 0,
        isCritical: false,
        currentDuration: d,
        crashSlope: slope,
        currentCost: a.normalCost + crashed * slope,
        remainingCrashTime: d - a.crashDuration
      };
    });

    this.forwardPass(nodes, order);

    const projectDuration = Math.max(...nodes.map(n => n.ef));

    this.backwardPass(nodes, order, projectDuration);

    // slack + critical
    nodes.forEach(n => {
      n.slack = n.ls - n.es;
      n.isCritical = Math.abs(n.slack) < 1e-6;
    });

    const allCriticalPaths = this.findAllCriticalPaths(nodes, projectDuration);

    return {
      activities: nodes,
      criticalPath: allCriticalPaths[0] || [],
      allCriticalPaths,
      projectDuration,
      totalDirectCost: nodes.reduce((s, n) => s + n.currentCost, 0)
    };
  }
}