import {WorldState} from './WorldState';
import {RuleEngine, IRuleEngineService} from '../engine/RuleEngine';

/**
 * Action plugin interface.
 * Uses currying to supply the rule engine service and the action property data,
 * so we only need to process it once.
 *
 * @export
 * @interface IActionPlugin
 */
export interface IConditionPlugin {
  evaluate: (service: IRuleEngineService, data?: any) => (worldState: WorldState) => void;
}

export interface ICondition {
    method: string;
    property?: string | Object;
    evaluate?: (worldState: WorldState) => void;
}
