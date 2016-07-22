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
export interface IActionPlugin {
  run: (service: IRuleEngineService, data?: any) => (worldState: WorldState) => void;
}

export interface IAction {
    method: string;
    property?: string | Object;
    delay?: number;
    run?: (worldState: WorldState) => void;
}

export class ActionHelper {
  static resolve(worldState: WorldState, prop: string) {
    switch (prop.toLowerCase()) {
      case '$location': return ActionHelper.getLocation(worldState);
      default: return null;
    }
  }

  static getLocation(worldState: WorldState) { return worldState.activeFeature.geometry; }

}
