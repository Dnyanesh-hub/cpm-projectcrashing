import { OptimizationResult, NetworkResult, ProjectInput, Activity } from '../types';

const BASE_URL = '/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || data.message || 'Request failed');
  return data.data;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data;
}

export const api = {
  optimize: (input: ProjectInput): Promise<OptimizationResult> =>
    post('/optimize', input),

  analyze: (activities: Activity[]): Promise<NetworkResult> =>
    post('/analyze', { activities }),

  getSample: (): Promise<ProjectInput> =>
    get('/sample'),
};
