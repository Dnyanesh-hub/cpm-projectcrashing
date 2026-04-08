import { Activity, CrashStep, OptimizationResult, ProjectInput } from '../types';
export declare class CrashingEngine {
    static optimize(input: ProjectInput): OptimizationResult;
    static computeCosts(res: any, acts: Activity[], durs: Map<string, number>, ic: number): {
        directCost: number;
        indirectCost: number;
        totalCost: number;
    };
    static buildStep(step: number, res: any, costs: any, act: string | null, inc: number): CrashStep;
    static finalize(steps: CrashStep[]): OptimizationResult;
}
//# sourceMappingURL=crashingEngine.d.ts.map