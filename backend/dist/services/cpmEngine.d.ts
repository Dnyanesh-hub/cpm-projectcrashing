import { Activity, ActivityNode, NetworkResult } from '../types';
export declare class CPMEngine {
    static detectCycles(activities: Activity[]): boolean;
    static topologicalSort(activities: Activity[]): string[];
    static forwardPass(nodes: ActivityNode[], order: string[]): void;
    static backwardPass(nodes: ActivityNode[], order: string[], duration: number): void;
    static findAllCriticalPaths(nodes: ActivityNode[], projectDuration: number): string[][];
    static calculate(activities: Activity[], overrideDurations?: Map<string, number>): NetworkResult;
}
//# sourceMappingURL=cpmEngine.d.ts.map