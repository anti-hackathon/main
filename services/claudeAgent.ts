import { RawSignal } from './mockApis';
import { useAgentStore } from '../store/agentStore';
import { useCrisisStore, Signal, Crisis, ResponsePlan } from '../store/crisisStore';

const MOCK_DELAY = 1500;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const callClaude = async (systemPrompt: string, inputData: any): Promise<any> => {
  // Always use mock data since anthropic dependency was removed
  await delay(MOCK_DELAY);
  
  if (systemPrompt.includes('Signal Processor')) {
    return {
      signals: inputData.map((s: any, i: number) => ({
        id: s.id || `sig_${i}`,
        event_type: 'urban_flooding',
        location: 'G-10',
        severity_hint: 'High',
        source: s.source,
        normalized_text: s.text || 'Normalized text',
        confidence: 0.92,
        timestamp: s.timestamp || new Date().toISOString()
      }))
    };
  }
  if (systemPrompt.includes('Crisis Detector')) {
    return {
      crises: [{
        id: 'crisis_001',
        type: 'urban_flooding',
        location: 'G-10',
        severity: 'CRITICAL',
        confidence_score: 0.95,
        affected_area_km2: 4.5,
        estimated_affected_people: 12000,
        reasoning: 'Multiple corroborated reports of flooding and stranded vehicles in G-10, supported by weather alerts.',
        corroborating_signals: inputData.signals?.map((s: any) => s.id) || [],
        coordinates: { lat: 33.6844, lng: 73.0479 }
      }]
    };
  }
  if (systemPrompt.includes('Response Planner')) {
    return {
      response_plan: {
        crisis_id: inputData.crises?.[0]?.id || 'crisis_001',
        priority: 'URGENT',
        actions: [
          { action_id: 'ACT_1', type: 'traffic_rerouting', description: 'Reroute traffic from G-10 Markaz via Ibn-e-Sina Road', responsible_agency: 'Islamabad Traffic Police', estimated_time_minutes: 5, status: 'PENDING' },
          { action_id: 'ACT_2', type: 'emergency_dispatch', description: 'Dispatch Rescue 1122 water rescue units', responsible_agency: 'Rescue 1122', estimated_time_minutes: 12, status: 'PENDING' },
          { action_id: 'ACT_3', type: 'public_alerts', description: 'Issue SMS alerts to residents of G-10', responsible_agency: 'NDMA', estimated_time_minutes: 8, status: 'PENDING' }
        ],
        alternate_routes: [
          { from: 'G-9/G-10 Signal', to: 'F-10', via: 'Nazim-ud-din Road', estimated_delay_reduction: 15 }
        ]
      }
    };
  }
  if (systemPrompt.includes('Execution Simulator')) {
    return {
      simulation: {
        timeline: [
          { minute: 4, action_id: 'ACT_1', status: 'COMPLETED', outcome_metric: 'Route updated' }
        ],
        final_outcomes: { congestion_reduction_pct: 68, response_time_minutes: 12, people_notified: 15000, routes_updated: 1 }
      }
    };
  }
  return {};
};

export const runCIROPipeline = async (rawSignals: RawSignal[]) => {
  const agentStore = useAgentStore.getState();
  const crisisStore = useCrisisStore.getState();
  
  agentStore.clearLogs();
  agentStore.initPipeline(['Signal Processor', 'Crisis Detector', 'Response Planner', 'Execution Simulator']);
  
  // AGENT 1
  agentStore.updateAgentLog('Signal Processor', { status: 'RUNNING', inputSummary: `${rawSignals.length} raw signals` });
  const start1 = Date.now();
  const processed = await callClaude(`You are Signal Processor Agent for CIRO Pakistan. Your job is to normalize and extract structured data from noisy, multi-source inputs including English, Urdu, and Roman Urdu text. Extract: event_type, location (Pakistani neighborhood), severity_hint, timestamp, source_type. Handle colloquial phrases like 'pani bhar gaya', 'jam lag gaya', 'aag lagi hai'. Return ONLY valid JSON, no markdown. Format: { "signals": [...] }`, rawSignals);
  agentStore.updateAgentLog('Signal Processor', { 
    status: 'COMPLETE', durationMs: Date.now() - start1, 
    outputSummary: `${processed.signals?.length || 0} normalized signals`, 
    rawJson: processed,
    reasoning: ['Detected Roman Urdu phrases', 'Extracted locations and timestamps']
  });
  agentStore.addExecutionLog(`Signal Processor: Normalized ${processed.signals?.length || 0} signals`);
  crisisStore.setSignals(processed.signals || []);

  // AGENT 2
  agentStore.updateAgentLog('Crisis Detector', { status: 'RUNNING', inputSummary: `${processed.signals?.length || 0} signals` });
  const start2 = Date.now();
  const crises = await callClaude(`You are Crisis Detector Agent. Analyze normalized signals and identify active crisis clusters. Cross-correlate signals from the same area. Assign severity: LOW | MEDIUM | HIGH | CRITICAL. Provide reasoning. Return ONLY valid JSON. Format: { "crises": [...] }`, processed);
  agentStore.updateAgentLog('Crisis Detector', { 
    status: 'COMPLETE', durationMs: Date.now() - start2, 
    outputSummary: `${crises.crises?.length || 0} crises detected`, 
    rawJson: crises,
    reasoning: crises.crises?.[0]?.reasoning ? [crises.crises[0].reasoning] : ['Cross-correlated signals']
  });
  agentStore.addExecutionLog(`Crisis Detector: ${crises.crises?.length || 0} crises detected`);
  
  // Inject coordinates if missing
  const enrichedCrises = (crises.crises || []).map((c: any) => ({
    ...c,
    coordinates: c.coordinates || { lat: 33.6844, lng: 73.0479 } // Default to G-10 for demo
  }));
  crisisStore.setCrises(enrichedCrises);

  if (enrichedCrises.length === 0) return;

  // AGENT 3
  agentStore.updateAgentLog('Response Planner', { status: 'RUNNING', inputSummary: `1 crisis` });
  const start3 = Date.now();
  const plan = await callClaude(`You are Response Planner Agent for Islamabad/Pakistan. Generate specific, actionable response plans for detected crises. Actions must include: traffic_rerouting (with specific Pakistani road names), emergency_dispatch (RESCUE 1122, Edhi Foundation, Police), public_alerts (Urdu + English), resource_allocation. Return ONLY valid JSON. Format: { "response_plan": { ... } }`, crises);
  agentStore.updateAgentLog('Response Planner', { 
    status: 'COMPLETE', durationMs: Date.now() - start3, 
    outputSummary: `${plan.response_plan?.actions?.length || 0} actions planned`, 
    rawJson: plan,
    reasoning: ['Allocated resources based on severity', 'Generated alternate routes']
  });
  agentStore.addExecutionLog(`Response Planner: Generated ${plan.response_plan?.actions?.length || 0} actions`);
  crisisStore.setResponsePlan(plan.response_plan);

  // AGENT 4
  agentStore.updateAgentLog('Execution Simulator', { status: 'RUNNING', inputSummary: `Response Plan` });
  const start4 = Date.now();
  const sim = await callClaude(`You are Execution Simulator Agent. Simulate the execution of response actions over a 30-minute timeline. For each action, generate realistic status updates, completion percentages, and outcome metrics. Return ONLY valid JSON. Format: { "simulation": { "timeline": [...], "final_outcomes": {...} } }`, plan);
  agentStore.updateAgentLog('Execution Simulator', { 
    status: 'COMPLETE', durationMs: Date.now() - start4, 
    outputSummary: `Simulation ready`, 
    rawJson: sim,
    reasoning: ['Simulated 30 minute timeline', 'Calculated outcomes']
  });
  agentStore.addExecutionLog(`Execution Simulator: Pipeline complete`);

  return { processed, crises: enrichedCrises, plan: plan.response_plan, sim };
};
