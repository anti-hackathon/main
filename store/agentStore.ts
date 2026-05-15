import { create } from 'zustand';

export type AgentStatus = 'PENDING' | 'RUNNING' | 'COMPLETE' | 'FAILED';

export interface AgentLog {
  id: string;
  agentName: string;
  status: AgentStatus;
  durationMs?: number;
  inputSummary?: string;
  outputSummary?: string;
  reasoning?: string[];
  rawJson?: any;
}

interface AgentStoreState {
  logs: AgentLog[];
  executionLogs: string[];
  initPipeline: (agents: string[]) => void;
  updateAgentLog: (agentName: string, updates: Partial<AgentLog>) => void;
  addExecutionLog: (message: string) => void;
  clearLogs: () => void;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  logs: [],
  executionLogs: [],
  initPipeline: (agents) => set({
    logs: agents.map(name => ({ id: name, agentName: name, status: 'PENDING' }))
  }),
  updateAgentLog: (agentName, updates) => set((state) => ({
    logs: state.logs.map(log => log.agentName === agentName ? { ...log, ...updates } : log)
  })),
  addExecutionLog: (message) => set((state) => ({
    executionLogs: [...state.executionLogs, `[${new Date().toLocaleTimeString()}] ${message}`]
  })),
  clearLogs: () => set({ logs: [], executionLogs: [] }),
}));
