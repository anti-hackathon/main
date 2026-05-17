import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { initFirebaseAdmin } from './firebase';
import { orchestrator } from './orchestrator';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (process.env.GOOGLE_APPLICATION_CREDENTIALS && !path.isAbsolute(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, '../../', process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
initFirebaseAdmin();

app.post('/api/signal', async (req, res) => {
  const { signal } = req.body;
  
  if (!signal) {
    return res.status(400).json({ error: 'Signal is required' });
  }

  try {
    console.log(`Received signal: ${signal}`);
    const result = await orchestrator.executeWorkflow(signal);
    res.json(result);
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ error: 'Workflow execution failed', details: error.message });
  }
});

app.post('/api/pipeline', async (req, res) => {
  const { signal, metadata } = req.body;
  
  if (!signal) {
    return res.status(400).json({ error: 'Signal is required' });
  }
  if (!metadata) {
    return res.status(400).json({ error: 'Metadata is required' });
  }

  try {
    console.log(`Running agent workflow for signal: ${signal}`);
    const result = await orchestrator.executeWorkflow(signal);
    
    const { analystOutput, plannerOutput, simulatorOutput } = result.full_trace;
    const { crisisId, category, description, severity, location, photoUri, timestamp } = metadata;
    
    // Calculate dynamic details
    const affectedAreaKm2 = parseFloat((2.5 + (severity * 0.8)).toFixed(1));
    const estimatedAffectedPeople = Math.round(150 + (severity * 300));
    const estimatedResponseTime = Math.max(10, 45 - (severity * 5));
    
    // Format Crisis object
    const crisis = {
      id: crisisId,
      title: analystOutput.detected_situation || `${category} Crisis at ${location.address}`,
      category: category,
      description: description,
      status: 'active',
      timestamp: timestamp,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      },
      severity: severity,
      affectedAreaKm2,
      estimatedAffectedPeople,
      reasoning: analystOutput.reasoning,
      corroboratingSignals: [
        `Reported: ${category} at ${location.address}. Description: ${description}`,
        `Metadata: Severity ${severity}/5, Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      ]
    };

    // Format ResponsePlan teams
    const targetResources = plannerOutput.target_resources || [];
    const teams = targetResources.map((resource: string, i: number) => ({
      role: resource,
      area: location.address.split(',')[0] || 'Islamabad District',
      eta: 8 + (i * 4),
    }));
    if (teams.length === 0) {
      teams.push({
        role: 'Emergency Response Unit',
        area: location.address.split(',')[0] || 'Islamabad District',
        eta: 12
      });
    }

    // Format ResponsePlan actions
    const recommendedActions = plannerOutput.recommended_actions || [];
    const actions = recommendedActions.map((act: any, i: number) => ({
      actionId: `act_${i}_${Date.now()}`,
      description: `${act.action_type}: ${act.details || act.target}`,
    }));
    if (actions.length === 0) {
      actions.push({
        actionId: `act_fallback_${Date.now()}`,
        description: `DISPATCH: Send first responders to ${location.address}`
      });
    }

    // Format Alternate Routes
    const alternateRoutes = [
      {
        from: location.address.split(',')[0] || 'Islamabad District',
        to: 'Alternative Route',
        via: 'Srinagar Highway Bypass',
        impactMinutes: Math.max(5, 25 - severity * 3)
      }
    ];

    // Format Simulation timeline
    const timeline = [
      { minute: 0, label: 'Crisis reported and signal ingestion complete.', status: 'COMPLETED' },
      { minute: 2, label: `Analyst detected situation with ${(analystOutput.confidence_level * 100).toFixed(0)}% confidence.`, status: 'COMPLETED' },
      { minute: 5, label: `Response Planner dispatched resource(s): ${teams.map((t: any) => t.role).join(', ')}.`, status: 'COMPLETED' },
      { minute: 15, label: `Simulator predicted state resolution: ${simulatorOutput.system_state_change}`, status: 'COMPLETED' },
    ];

    // Format ResponsePlan object
    const plan = {
      crisisId: crisisId,
      status: 'active',
      summary: plannerOutput.reasoning || `Coordinated response plan for the ${category} incident.`,
      estimatedResponseTime,
      teams,
      actions,
      alternateRoutes,
      simulation: {
        congestionReductionPct: Math.min(85, 30 + severity * 8),
        routesUpdated: recommendedActions.filter((a: any) => a.action_type === 'REROUTE').length || 1,
        responseTimeMinutes: Math.max(8, 35 - severity * 4),
        timeline
      }
    };

    // Format AgentLog object
    const agentLog = {
      crisisId: crisisId,
      steps: [
        {
          id: `analyst_${Date.now()}`,
          agentName: 'Signal Analyst',
          status: 'COMPLETE',
          action: 'Analyze incoming raw feeds & isolate anomalies',
          reasoning: analystOutput.reasoning,
          inputSummary: signal,
          outputSummary: analystOutput.detected_situation,
          rawJson: analystOutput
        },
        {
          id: `planner_${Date.now()}`,
          agentName: 'Response Planner',
          status: 'COMPLETE',
          action: 'Formulate routing mitigations & asset deployment',
          reasoning: plannerOutput.reasoning,
          inputSummary: analystOutput.detected_situation,
          outputSummary: recommendedActions.map((a: any) => a.action_type).join(', '),
          rawJson: plannerOutput
        },
        {
          id: `simulator_${Date.now()}`,
          agentName: 'Simulator',
          status: 'COMPLETE',
          action: 'Validate plans against mock traffic/weather graphs',
          reasoning: simulatorOutput.reasoning,
          inputSummary: JSON.stringify(recommendedActions),
          outputSummary: simulatorOutput.system_state_change,
          rawJson: simulatorOutput
        }
      ]
    };

    res.json({
      success: true,
      crisis,
      plan,
      agentLog
    });

  } catch (error: any) {
    console.error('Error running pipeline:', error);
    res.status(500).json({ error: 'Pipeline execution failed', details: error.message });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CIRO Server is running on port ${PORT}`);
});
