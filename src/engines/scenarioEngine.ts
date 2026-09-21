import { Token } from '../types/token';
import { ScenarioAnalysis } from '../types/opportunity';
import { buildScenarioAnalysis } from '../utils/math';

export class ScenarioEngine {
  public generateScenarios(token: Token): ScenarioAnalysis {
    return buildScenarioAnalysis(token);
  }
}

export const scenarioEngine = new ScenarioEngine();
