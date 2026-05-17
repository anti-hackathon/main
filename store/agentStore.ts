import { create } from 'zustand';

export type AgentStatus = 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';

export interface AgentLogStep {
  id: string;
  agentName: string;
  status: AgentStatus;
  action: string;
  reasoning: string;
  inputSummary?: string;
  outputSummary?: string;
  rawJson?: any;
}

export interface AgentLog {
  crisisId: string;
  steps: AgentLogStep[];
}

interface AgentStoreState {
  logs: AgentLog[];
  pipelineStatus: 'idle' | 'running' | 'complete' | 'failed';
  activeCrisisId: string | null;
  antigravityCoreStatus: 'idle' | 'initializing' | 'orchestrating' | 'done' | 'failed';
  setPipelineStatus: (status: 'idle' | 'running' | 'complete' | 'failed') => void;
  setAntigravityCoreStatus: (status: 'idle' | 'initializing' | 'orchestrating' | 'done' | 'failed') => void;
  setActiveCrisisId: (crisisId: string | null) => void;
  replaceLog: (log: AgentLog) => void;
  clearLogs: () => void;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  logs: [],
  pipelineStatus: 'idle',
  activeCrisisId: null,
  antigravityCoreStatus: 'idle',
  setPipelineStatus: (status) => set({ pipelineStatus: status }),
  setAntigravityCoreStatus: (status) => set({ antigravityCoreStatus: status }),
  setActiveCrisisId: (crisisId) => set({ activeCrisisId: crisisId }),
  replaceLog: (log) => set((state) => {
    const filtered = state.logs.filter((l) => l.crisisId !== log.crisisId);
    return { logs: [...filtered, log] };
  }),
  clearLogs: () => set({ logs: [], pipelineStatus: 'idle', activeCrisisId: null, antigravityCoreStatus: 'idle' }),
}));
