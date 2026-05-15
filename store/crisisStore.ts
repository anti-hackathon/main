import { create } from 'zustand';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Signal {
  id: string;
  event_type?: string;
  location: string;
  severity_hint?: string;
  source: string;
  normalized_text: string;
  confidence: number;
  timestamp: string;
}

export interface Crisis {
  id: string;
  type: string;
  location: string;
  severity: Severity;
  confidence_score: number;
  affected_area_km2: number;
  estimated_affected_people: number;
  reasoning: string;
  corroborating_signals: string[];
  coordinates?: { lat: number; lng: number };
}

export interface ResponseAction {
  action_id: string;
  type: string;
  description: string;
  responsible_agency: string;
  estimated_time_minutes: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface AlternateRoute {
  from: string;
  to: string;
  via: string;
  estimated_delay_reduction: number;
}

export interface ResponsePlan {
  crisis_id: string;
  priority: string;
  actions: ResponseAction[];
  alternate_routes: AlternateRoute[];
}

interface CrisisState {
  rawSignals: any[];
  signals: Signal[];
  crises: Crisis[];
  responsePlan: ResponsePlan | null;
  addRawSignal: (signal: any) => void;
  setSignals: (signals: Signal[]) => void;
  setCrises: (crises: Crisis[]) => void;
  setResponsePlan: (plan: ResponsePlan) => void;
  clearAll: () => void;
}

export const useCrisisStore = create<CrisisState>((set) => ({
  rawSignals: [],
  signals: [],
  crises: [],
  responsePlan: null,
  addRawSignal: (signal) => set((state) => ({ rawSignals: [...state.rawSignals, signal] })),
  setSignals: (signals) => set({ signals }),
  setCrises: (crises) => set({ crises }),
  setResponsePlan: (plan) => set({ responsePlan: plan }),
  clearAll: () => set({ rawSignals: [], signals: [], crises: [], responsePlan: null }),
}));
