import { GoogleGenerativeAI } from '@google/generative-ai';
import { AGENT_PROMPTS, MOCK_APIS } from './agents';
import { db } from './firebase';

// We will initialize the AI client dynamically so that env vars are loaded first
let aiClient: GoogleGenerativeAI;
const getAI = () => {
  if (!aiClient) aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock-key');
  return aiClient;
};

export interface AgentTrace {
  timestamp: string;
  agent_id: string;
  input_state: any;
  output: any;
  decision_rationale: string;
}

class AntigravityCore {
  private async logTrace(trace: Omit<AgentTrace, 'timestamp'>) {
    const fullTrace = {
      ...trace,
      timestamp: new Date().toISOString()
    };
    try {
      await db().collection('reasoning_traces').add(fullTrace);
      console.log(`[TRACE LOGGED] Agent: ${trace.agent_id}`);
    } catch (error) {
      console.error('Failed to log trace:', error);
    }
  }

  private async callAgent(prompt: string, input: string): Promise<any> {

    try {
      const ai = getAI();
      const model = ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const response = await model.generateContent(`${prompt}\n\nINPUT DATA:\n${input}`);
      return JSON.parse(response.response.text() || '{}');
    } catch (e: any) {
      console.error('LLM Error:', e);
      throw new Error('Agent execution failed completely');
    }
  }

  public async executeWorkflow(signal: string) {
    console.log('--- STARTING ANTIGRAVITY WORKFLOW ---');

    // Extract a rough location from the signal to make the mock tools dynamic for Islamabad
    const locationMatch = signal.match(/(G-\d+|F-\d+|I-\d+|E-\d+|H-\d+|D-\d+|Blue Area|Faizabad|Highway|Nale|Nullah|Markaz)/i);
    const location = locationMatch ? locationMatch[0] : 'Islamabad City';

    // Tool Invocation (Simulated for Signal Analyst context)
    const weatherData = MOCK_APIS.getWeatherAlerts(location);
    const trafficData = MOCK_APIS.checkTrafficCongestion(location);
    
    const enrichedSignal = JSON.stringify({
      user_signal: signal,
      weather: weatherData,
      traffic: trafficData
    });

    // 1. Signal Analyst
    console.log('1. Running Signal Analyst...');
    const analystOutput = await this.callAgent(AGENT_PROMPTS.SIGNAL_ANALYST, enrichedSignal);
    await this.logTrace({
      agent_id: 'Signal_Analyst',
      input_state: enrichedSignal,
      output: analystOutput,
      decision_rationale: analystOutput.reasoning
    });

    // 2. Response Planner
    console.log('2. Running Response Planner...');
    const plannerInput = JSON.stringify(analystOutput);
    const plannerOutput = await this.callAgent(AGENT_PROMPTS.RESPONSE_PLANNER, plannerInput);
    await this.logTrace({
      agent_id: 'Response_Planner',
      input_state: plannerInput,
      output: plannerOutput,
      decision_rationale: plannerOutput.reasoning
    });

    // Tool Invocation (Simulated execution based on planner)
    console.log('Dispatching dynamic actions based on Planner...');
    if (plannerOutput.recommended_actions && Array.isArray(plannerOutput.recommended_actions)) {
      plannerOutput.recommended_actions.forEach((action: any) => {
        if (action.action_type === 'DISPATCH' || action.action_type === 'ALERT') {
          MOCK_APIS.dispatchEmergencyTicket(action.target, action.details || location);
        } else if (action.action_type === 'REROUTE') {
          MOCK_APIS.updateMapRouting([action.target], [action.details]);
        }
      });
    } else {
      MOCK_APIS.dispatchEmergencyTicket('Emergency Response', location);
      MOCK_APIS.updateMapRouting([`${location} Main`], [`${location} Alt`]);
    }

    // 3. Simulator
    console.log('3. Running Simulator...');
    const simulatorInput = JSON.stringify({
      situation: analystOutput,
      planned_actions: plannerOutput
    });
    const simulatorOutput = await this.callAgent(AGENT_PROMPTS.SIMULATOR, simulatorInput);
    await this.logTrace({
      agent_id: 'Simulator',
      input_state: simulatorInput,
      output: simulatorOutput,
      decision_rationale: simulatorOutput.reasoning
    });

    console.log('--- ANTIGRAVITY WORKFLOW COMPLETE ---');

    return {
      success: true,
      final_state: simulatorOutput,
      full_trace: { analystOutput, plannerOutput, simulatorOutput }
    };
  }
}

export const orchestrator = new AntigravityCore();
