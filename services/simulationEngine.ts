import { ResponsePlan, ResponseAction } from '../store/crisisStore';
import { useAgentStore } from '../store/agentStore';

export interface SimulationMetrics {
  congestionLevel: number;
  emergencyUnitsDeployed: number;
  alertsSent: number;
  routesUpdated: number;
}

export interface SimulationTick {
  minute: number;
  actions: ResponseAction[];
  metrics: SimulationMetrics;
}

export class SimulationEngine {
  private timeline: SimulationTick[] = [];
  private subscribers: ((tick: SimulationTick) => void)[] = [];
  private isRunning = false;

  async runSimulation(responsePlan: ResponsePlan, durationMinutes = 30) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timeline = [];
    
    useAgentStore.getState().addExecutionLog(`Starting simulation for ${durationMinutes} minutes...`);

    for (let minute = 0; minute <= durationMinutes; minute += 2) {
      if (!this.isRunning) break;
      await new Promise(r => setTimeout(r, 400)); // 400ms per sim-minute

      const updatedActions = this.computeActionStates(responsePlan.actions, minute);
      
      const tick: SimulationTick = {
        minute,
        actions: updatedActions,
        metrics: {
          congestionLevel: Math.max(20, 95 - (minute * 2.5)),
          emergencyUnitsDeployed: Math.min(5, Math.floor(minute / 4)),
          alertsSent: Math.min(50000, minute * 1800),
          routesUpdated: minute > 4 ? Math.min(8, Math.floor(minute / 3)) : 0,
        }
      };
      
      this.timeline.push(tick);
      this.subscribers.forEach(fn => fn(tick));

      if (minute === 4) useAgentStore.getState().addExecutionLog(`Simulator: Route updated on Google Maps`);
      if (minute === 8) useAgentStore.getState().addExecutionLog(`Simulator: SMS alerts sent to ${tick.metrics.alertsSent} users`);
      if (minute === 12) useAgentStore.getState().addExecutionLog(`Simulator: RESCUE 1122 dispatched to location`);
      if (minute === 24) useAgentStore.getState().addExecutionLog(`Simulator: Congestion reduced to ${Math.round(tick.metrics.congestionLevel)}%`);
    }
    
    this.isRunning = false;
    useAgentStore.getState().addExecutionLog(`Simulation completed.`);
    return this.timeline;
  }

  stop() {
    this.isRunning = false;
  }

  private computeActionStates(actions: ResponseAction[], minute: number): ResponseAction[] {
    return actions.map(action => {
      let status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' = 'PENDING';
      if (minute >= action.estimated_time_minutes) {
        status = 'COMPLETED';
      } else if (minute > 0 && minute < action.estimated_time_minutes) {
        status = 'IN_PROGRESS';
      }
      return { ...action, status };
    });
  }

  subscribe(fn: (tick: SimulationTick) => void) {
    this.subscribers.push(fn);
    return () => { this.subscribers = this.subscribers.filter(s => s !== fn); };
  }
}

export const simulationEngine = new SimulationEngine();
