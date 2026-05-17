import { create } from 'zustand';
import { CrisisCategory, CrisisStatus, PlanStatus, SeverityLevel } from '../constants/role3Theme';

export { SeverityLevel };

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
  title: string;
  category: CrisisCategory;
  description: string;
  status: CrisisStatus;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: SeverityLevel;
  affectedAreaKm2?: number;
  estimatedAffectedPeople?: number;
  reasoning?: string;
  corroboratingSignals?: string[];
}

export interface ResponseAction {
  actionId: string;
  description: string;
}

export interface AlternateRoute {
  from: string;
  to: string;
  via: string;
  impactMinutes: number;
}

export interface ResponsePlan {
  crisisId: string;
  status: PlanStatus;
  summary: string;
  estimatedResponseTime: number;
  teams: Array<{
    role: string;
    area: string;
    eta: number;
  }>;
  actions: ResponseAction[];
  alternateRoutes: AlternateRoute[];
  simulation?: {
    congestionReductionPct: number;
    routesUpdated: number;
    responseTimeMinutes: number;
    timeline: Array<{
      minute: number;
      label: string;
      status: string;
    }>;
  };
}

interface CrisisState {
  rawSignals: any[];
  signals: Signal[];
  crises: Crisis[];
  responsePlan: ResponsePlan | null;
  responsePlans: Record<string, ResponsePlan>;
  selectedCrisisId: string | null;
  recentlySubmittedCrisisId: string | null;
  addRawSignal: (signal: any) => void;
  setSignals: (signals: Signal[]) => void;
  setCrises: (crises: Crisis[]) => void;
  upsertCrisis: (crisis: Crisis) => void;
  setResponsePlan: (plan: ResponsePlan) => void;
  setSelectedCrisis: (crisisId: string | null) => void;
  markRecentlySubmitted: (crisisId: string | null) => void;
  clearAll: () => void;
}

export const useCrisisStore = create<CrisisState>((set) => ({
  rawSignals: [],
  signals: [],
  crises: [],
  responsePlan: null,
  responsePlans: {},
  selectedCrisisId: null,
  recentlySubmittedCrisisId: null,
  addRawSignal: (signal) => set((state) => ({ rawSignals: [...state.rawSignals, signal] })),
  setSignals: (signals) => set({ signals }),
  setCrises: (crises) => set({ crises }),
  upsertCrisis: (crisis) => set((state) => {
    const exists = state.crises.some((c) => c.id === crisis.id);
    const updatedCrises = exists
      ? state.crises.map((c) => (c.id === crisis.id ? crisis : c))
      : [crisis, ...state.crises];
    return { crises: updatedCrises };
  }),
  setResponsePlan: (plan) => set((state) => ({
    responsePlan: plan,
    responsePlans: { ...state.responsePlans, [plan.crisisId]: plan }
  })),
  setSelectedCrisis: (crisisId) => set({ selectedCrisisId: crisisId }),
  markRecentlySubmitted: (crisisId) => set({ recentlySubmittedCrisisId: crisisId }),
  clearAll: () => set({ rawSignals: [], signals: [], crises: [], responsePlan: null, responsePlans: {}, selectedCrisisId: null, recentlySubmittedCrisisId: null }),
}));
