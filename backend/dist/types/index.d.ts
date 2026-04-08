export interface Activity {
    id: string;
    name: string;
    normalDuration: number;
    crashDuration: number;
    normalCost: number;
    crashCost: number;
    predecessors: string[];
}
export interface ActivityNode extends Activity {
    es: number;
    ef: number;
    ls: number;
    lf: number;
    slack: number;
    isCritical: boolean;
    currentDuration: number;
    currentCost: number;
    crashSlope: number;
    remainingCrashTime: number;
}
export interface NetworkResult {
    activities: ActivityNode[];
    criticalPath: string[];
    allCriticalPaths: string[][];
    projectDuration: number;
    totalDirectCost: number;
}
export interface CrashStep {
    step: number;
    projectDuration: number;
    directCost: number;
    indirectCost: number;
    totalCost: number;
    criticalPath: string[];
    crashedActivity: string | null;
    crashAmount: number;
    activities: ActivityNode[];
    incrementalCost: number;
}
export interface OptimizationResult {
    steps: CrashStep[];
    optimalDuration: number;
    optimalTotalCost: number;
    normalDuration: number;
    normalTotalCost: number;
    crashDuration: number;
    crashTotalCost: number;
}
export interface ProjectInput {
    activities: Activity[];
    indirectCostPerDay: number;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=index.d.ts.map