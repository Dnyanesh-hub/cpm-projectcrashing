import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity, OptimizationResult, NetworkResult, Theme } from '../types';
import { api } from '../services/api';

interface AppState {
  // Project data
  activities: Activity[];
  indirectCostPerDay: number;
  theme: Theme;

  // Results
  optimizationResult: OptimizationResult | null;
  networkResult: NetworkResult | null;
  currentStep: number;

  // UI state
  isLoading: boolean;
  error: string | null;
  activeTab: string;

  // Actions
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
  setIndirectCost: (cost: number) => void;
  setTheme: (theme: Theme) => void;
  setCurrentStep: (step: number) => void;
  setActiveTab: (tab: string) => void;
  clearError: () => void;

  // Async actions
  runOptimization: () => Promise<void>;
  loadSample: () => Promise<void>;
  resetProject: () => void;
}

const DEFAULT_ACTIVITIES: Activity[] = [];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activities: DEFAULT_ACTIVITIES,
      indirectCostPerDay: 1000,
      theme: 'dark',
      optimizationResult: null,
      networkResult: null,
      currentStep: 0,
      isLoading: false,
      error: null,
      activeTab: 'input',

      setActivities: (activities) => set({ activities }),
      addActivity: (activity) =>
        set((s) => ({ activities: [...s.activities, activity] })),
      updateActivity: (id, updated) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, ...updated } : a
          ),
        })),
      removeActivity: (id) =>
        set((s) => ({
          activities: s.activities.filter((a) => a.id !== id),
        })),
      setIndirectCost: (indirectCostPerDay) => set({ indirectCostPerDay }),
      setTheme: (theme) => set({ theme }),
      setCurrentStep: (currentStep) => set({ currentStep }),
      setActiveTab: (activeTab) => set({ activeTab }),
      clearError: () => set({ error: null }),

      runOptimization: async () => {
        const { activities, indirectCostPerDay } = get();
        if (activities.length === 0) {
          set({ error: 'Please add at least one activity.' });
          return;
        }
        set({ isLoading: true, error: null });
        try {
          const result = await api.optimize({ activities, indirectCostPerDay });
          set({
            optimizationResult: result,
            currentStep: 0,
            activeTab: 'network',
            isLoading: false,
          });
        } catch (e: any) {
          set({ error: e.message || 'Optimization failed', isLoading: false });
        }
      },

      loadSample: async () => {
        set({ isLoading: true, error: null });
        try {
          const sample = await api.getSample();
          set({
            activities: sample.activities,
            indirectCostPerDay: sample.indirectCostPerDay,
            optimizationResult: null,
            networkResult: null,
            currentStep: 0,
            isLoading: false,
            activeTab: 'input',
          });
        } catch (e: any) {
          set({ error: e.message || 'Failed to load sample', isLoading: false });
        }
      },

      resetProject: () =>
        set({
          activities: [],
          indirectCostPerDay: 1000,
          optimizationResult: null,
          networkResult: null,
          currentStep: 0,
          error: null,
          activeTab: 'input',
        }),
    }),
    {
      name: 'cpm-optimizer-storage',
      partialize: (state) => ({
        activities: state.activities,
        indirectCostPerDay: state.indirectCostPerDay,
        theme: state.theme,
      }),
    }
  )
);
