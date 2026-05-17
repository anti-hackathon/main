import { RawSignal } from './mockApis';
import { useAgentStore, AgentLog, AgentLogStep } from '../store/agentStore';
import {
  Crisis,
  CrisisLocation,
  ResponsePlan,
  Signal,
  SimulationOutcome,
  useCrisisStore,
} from '../store/crisisStore';
import { CrisisCategory, SeverityLevel } from '../constants/role3Theme';

const MOCK_DELAY = 1500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface PipelineReportContext {
  crisisId: string;
  category: CrisisCategory;
  description: string;
  severity: SeverityLevel;
  location: CrisisLocation;
  photoUri?: string;
  timestamp: string;
}

interface SignalProcessorOutput {
  signals: Array<{
    id: string;
    event_type: string;
    location: string;
    severity_hint: string;
    source: string;
    normalized_text: string;
    confidence: number;
    timestamp: string;
  }>;
}

interface CrisisDetectorOutput {
  crises: Array<{
    id: string;
    type: string;
    location: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence_score: number;
    affected_area_km2: number;
    estimated_affected_people: number;
    reasoning: string;
    corroborating_signals: string[];
    coordinates: { lat: number; lng: number };
  }>;
}

interface PlannerAction {
  action_id: string;
  type: string;
  description: string;
  responsible_agency: string;
  estimated_time_minutes: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface PlannerRoute {
  from: string;
  to: string;
  via: string;
  estimated_delay_reduction: number;
}

interface ResponsePlannerOutput {
  response_plan: {
    crisis_id: string;
    priority: string;
    actions: PlannerAction[];
    alternate_routes: PlannerRoute[];
  };
}

interface SimulatorOutput {
  simulation: {
    timeline: Array<{
      minute: number;
      action_id: string;
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      outcome_metric: string;
    }>;
    final_outcomes: {
      congestion_reduction_pct: number;
      response_time_minutes: number;
      people_notified: number;
      routes_updated: number;
    };
  };
}

export interface PipelineResult {
  crisis: Crisis;
  plan: ResponsePlan;
  agentLog: AgentLog;
  simulation: SimulationOutcome;
}

const mapSeverityTextToNumber = (severity: string, fallback: SeverityLevel): SeverityLevel => {
  switch (severity) {
    case 'LOW':
      return 2;
    case 'MEDIUM':
      return 3;
    case 'HIGH':
      return 4;
    case 'CRITICAL':
      return 5;
    default:
      return fallback;
  }
};

const toSignalStoreShape = (signals: SignalProcessorOutput['signals']): Signal[] =>
  signals.map((signal) => ({
    id: signal.id,
    eventType: signal.event_type,
    location: signal.location,
    source: signal.source,
    normalizedText: signal.normalized_text,
    confidence: signal.confidence,
    timestamp: signal.timestamp,
  }));

const buildResponsePlan = (
  output: ResponsePlannerOutput,
  simulation: SimulationOutcome,
  crisis: Crisis
): ResponsePlan => {
  const actions = output.response_plan.actions.map((action) => ({
    actionId: action.action_id,
    type: action.type,
    description: action.description,
    responsibleAgency: action.responsible_agency,
    estimatedTimeMinutes: action.estimated_time_minutes,
    status: action.status,
  }));

  const teams = actions.map((action) => ({
    role: action.responsibleAgency,
    area: crisis.location.address,
    eta: action.estimatedTimeMinutes,
  }));

  const alternateRoutes = output.response_plan.alternate_routes.map((route) => ({
    from: route.from,
    to: route.to,
    via: route.via,
    estimatedDelayReduction: route.estimated_delay_reduction,
    impactMinutes: route.estimated_delay_reduction,
  }));

  return {
    crisisId: crisis.id,
    summary: `${crisis.category} response coordinated around ${crisis.location.address}`,
    teams,
    status: 'active',
    createdAt: new Date().toISOString(),
    estimatedResponseTime:
      actions.length > 0
        ? Math.max(...actions.map((action) => action.estimatedTimeMinutes))
        : simulation.responseTimeMinutes,
    actions,
    alternateRoutes,
    impactSummary: `Projected congestion improvement of ${simulation.congestionReductionPct}% with ${simulation.routesUpdated} routing updates.`,
    simulation,
  };
};

const buildSimulationOutcome = (output: SimulatorOutput): SimulationOutcome => ({
  congestionReductionPct: output.simulation.final_outcomes.congestion_reduction_pct,
  responseTimeMinutes: output.simulation.final_outcomes.response_time_minutes,
  peopleNotified: output.simulation.final_outcomes.people_notified,
  routesUpdated: output.simulation.final_outcomes.routes_updated,
  timeline: output.simulation.timeline.map((item) => ({
    minute: item.minute,
    label: item.outcome_metric,
    status: item.status,
  })),
});

export const callClaude = async (
  systemPrompt: string,
  inputData: unknown
): Promise<SignalProcessorOutput | CrisisDetectorOutput | ResponsePlannerOutput | SimulatorOutput> => {
  await delay(MOCK_DELAY);

  if (systemPrompt.includes('Signal Processor')) {
    return {
      signals: (inputData as RawSignal[]).map((signal, index) => ({
        id: signal.id || `sig_${index}`,
        event_type: 'urban_flooding',
        location: 'G-10',
        severity_hint: 'High',
        source: signal.source,
        normalized_text: signal.text || 'Normalized text',
        confidence: 0.92,
        timestamp: signal.timestamp || new Date().toISOString(),
      })),
    };
  }

  if (systemPrompt.includes('Crisis Detector')) {
    return {
      crises: [
        {
          id: 'crisis_001',
          type: 'urban_flooding',
          location: 'G-10',
          severity: 'CRITICAL',
          confidence_score: 0.95,
          affected_area_km2: 4.5,
          estimated_affected_people: 12000,
          reasoning:
            'Multiple corroborated reports of flooding and stranded vehicles in G-10, supported by weather alerts.',
          corroborating_signals: (inputData as SignalProcessorOutput).signals?.map((signal) => signal.id) || [],
          coordinates: { lat: 33.6844, lng: 73.0479 },
        },
      ],
    };
  }

  if (systemPrompt.includes('Response Planner')) {
    return {
      response_plan: {
        crisis_id: (inputData as CrisisDetectorOutput).crises?.[0]?.id || 'crisis_001',
        priority: 'URGENT',
        actions: [
          {
            action_id: 'ACT_1',
            type: 'traffic_rerouting',
            description: 'Reroute traffic from G-10 Markaz via Ibn-e-Sina Road',
            responsible_agency: 'Islamabad Traffic Police',
            estimated_time_minutes: 5,
            status: 'PENDING',
          },
          {
            action_id: 'ACT_2',
            type: 'emergency_dispatch',
            description: 'Dispatch Rescue 1122 water rescue units',
            responsible_agency: 'Rescue 1122',
            estimated_time_minutes: 12,
            status: 'PENDING',
          },
          {
            action_id: 'ACT_3',
            type: 'public_alerts',
            description: 'Issue SMS alerts to residents of G-10',
            responsible_agency: 'NDMA',
            estimated_time_minutes: 8,
            status: 'PENDING',
          },
        ],
        alternate_routes: [
          {
            from: 'G-9/G-10 Signal',
            to: 'F-10',
            via: 'Nazim-ud-din Road',
            estimated_delay_reduction: 15,
          },
        ],
      },
    };
  }

  return {
    simulation: {
      timeline: [
        { minute: 4, action_id: 'ACT_1', status: 'COMPLETED', outcome_metric: 'Route updated' },
        { minute: 8, action_id: 'ACT_3', status: 'COMPLETED', outcome_metric: 'Area alert delivered' },
        { minute: 12, action_id: 'ACT_2', status: 'COMPLETED', outcome_metric: 'Water rescue unit reached sector edge' },
      ],
      final_outcomes: {
        congestion_reduction_pct: 68,
        response_time_minutes: 12,
        people_notified: 15000,
        routes_updated: 1,
      },
    },
  };
};

export const runCIROPipeline = async (
  rawSignals: RawSignal[],
  reportContext: PipelineReportContext
): Promise<PipelineResult> => {
  const agentStore = useAgentStore.getState();
  const crisisStore = useCrisisStore.getState();
  const collectedSteps: AgentLogStep[] = [];

  const pushStep = (step: AgentLogStep) => {
    collectedSteps.push(step);
    agentStore.appendStep(reportContext.crisisId, step);
  };

  try {
    agentStore.startPipeline(reportContext.crisisId);
    agentStore.addExecutionLog(`Report intake started for ${reportContext.location.address}`);

    const signalOutput = (await callClaude(
      `You are Signal Processor Agent for CIRO Pakistan. Your job is to normalize and extract structured data from noisy, multi-source inputs including English, Urdu, and Roman Urdu text. Extract: event_type, location (Pakistani neighborhood), severity_hint, timestamp, source_type. Handle colloquial phrases like 'pani bhar gaya', 'jam lag gaya', 'aag lagi hai'. Return ONLY valid JSON, no markdown. Format: { "signals": [...] }`,
      rawSignals
    )) as SignalProcessorOutput;

    crisisStore.setSignals(toSignalStoreShape(signalOutput.signals));
    pushStep({
      id: `${reportContext.crisisId}-signal`,
      agentName: 'Signal Processor',
      action: 'Normalized incoming mobile, weather, and traffic signals',
      reasoning: 'The report description was structured into location-aware crisis signals for downstream agents.',
      timestamp: new Date().toISOString(),
      status: 'COMPLETE',
      inputSummary: `${rawSignals.length} raw inputs`,
      outputSummary: `${signalOutput.signals.length} structured signals`,
      rawJson: signalOutput,
    });
    agentStore.addExecutionLog(`Signal Processor clustered ${signalOutput.signals.length} field signals`);

    const detectorOutput = (await callClaude(
      `You are Crisis Detector Agent. Analyze normalized signals and identify active crisis clusters. Cross-correlate signals from the same area. Assign severity: LOW | MEDIUM | HIGH | CRITICAL. Provide reasoning. Return ONLY valid JSON. Format: { "crises": [...] }`,
      signalOutput
    )) as CrisisDetectorOutput;

    const detected = detectorOutput.crises[0];
    pushStep({
      id: `${reportContext.crisisId}-detector`,
      agentName: 'Crisis Detector',
      action: 'Classified the localized event and severity',
      reasoning: detected.reasoning,
      timestamp: new Date().toISOString(),
      status: 'COMPLETE',
      inputSummary: `${signalOutput.signals.length} normalized signals`,
      outputSummary: `${detectorOutput.crises.length} crisis cluster`,
      rawJson: detectorOutput,
    });
    agentStore.addExecutionLog(`Crisis Detector raised a ${detected.severity.toLowerCase()} incident flag`);

    const crisis: Crisis = {
      id: reportContext.crisisId,
      title: `${reportContext.category} alert in ${reportContext.location.address}`,
      category: reportContext.category,
      description: reportContext.description,
      severity: Math.max(
        reportContext.severity,
        mapSeverityTextToNumber(detected.severity, reportContext.severity)
      ) as SeverityLevel,
      location: reportContext.location,
      photoUri: reportContext.photoUri,
      timestamp: reportContext.timestamp,
      status: 'active',
      confidenceScore: detected.confidence_score,
      affectedPeopleEstimate: detected.estimated_affected_people,
      affectedAreaKm2: detected.affected_area_km2,
      reasoning: detected.reasoning,
    };

    const plannerOutput = (await callClaude(
      `You are Response Planner Agent for Islamabad/Pakistan. Generate specific, actionable response plans for detected crises. Actions must include: traffic_rerouting (with specific Pakistani road names), emergency_dispatch (RESCUE 1122, Edhi Foundation, Police), public_alerts (Urdu + English), resource_allocation. Return ONLY valid JSON. Format: { "response_plan": { ... } }`,
      detectorOutput
    )) as ResponsePlannerOutput;

    pushStep({
      id: `${reportContext.crisisId}-planner`,
      agentName: 'Response Planner',
      action: 'Assigned response teams and alternate routes',
      reasoning: `Planned ${plannerOutput.response_plan.actions.length} coordinated actions around ${reportContext.location.address}.`,
      timestamp: new Date().toISOString(),
      status: 'COMPLETE',
      inputSummary: `${detectorOutput.crises.length} detected incident`,
      outputSummary: `${plannerOutput.response_plan.actions.length} coordinated actions`,
      rawJson: plannerOutput,
    });
    agentStore.addExecutionLog('Response Planner assembled traffic, rescue, and public alert actions');

    const simulatorOutput = (await callClaude(
      `You are Execution Simulator Agent. Simulate the execution of response actions over a 30-minute timeline. For each action, generate realistic status updates, completion percentages, and outcome metrics. Return ONLY valid JSON. Format: { "simulation": { "timeline": [...], "final_outcomes": {...} } }`,
      plannerOutput
    )) as SimulatorOutput;

    const simulation = buildSimulationOutcome(simulatorOutput);
    pushStep({
      id: `${reportContext.crisisId}-sim`,
      agentName: 'Execution Simulator',
      action: 'Calculated the projected before/after response impact',
      reasoning: `Simulation predicts ${simulation.congestionReductionPct}% congestion reduction after coordinated response.`,
      timestamp: new Date().toISOString(),
      status: 'COMPLETE',
      inputSummary: `${plannerOutput.response_plan.actions.length} actions queued`,
      outputSummary: `${simulation.routesUpdated} route changes and ${simulation.peopleNotified} alerts`,
      rawJson: simulatorOutput,
    });
    agentStore.addExecutionLog('Execution Simulator produced final impact estimates');

    const plan = buildResponsePlan(plannerOutput, simulation, crisis);
    const agentLog: AgentLog = {
      crisisId: reportContext.crisisId,
      steps: collectedSteps.map((step) => ({
        ...step,
      })),
    };

    agentStore.replaceLog(agentLog);
    agentStore.setPipelineStatus('complete');

    return {
      crisis,
      plan,
      agentLog,
      simulation,
    };
  } catch (error) {
    pushStep({
      id: `${reportContext.crisisId}-failed`,
      agentName: 'Pipeline Monitor',
      action: 'The crisis pipeline stopped before producing a coordinated plan',
      reasoning: error instanceof Error ? error.message : 'Unknown pipeline failure',
      timestamp: new Date().toISOString(),
      status: 'FAILED',
    });
    agentStore.setPipelineStatus('failed');
    throw error;
  }
};
