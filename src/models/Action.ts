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
    /**
     * The method to execute. Typically is matched with a Javascript library that can be run.
     *
     * @type {string}
     */
    method: string;
    /**
     * Property string or object that contains the specific properties for this method.
     *
     * @type {(string | Object)}
     */
    property?: string | Object;
    /**
     * Before triggering the action, wait for delayInMSec microseconds.
     *
     * @type {number}
     */
    delayInMSec?: number;
    /**
     * Internal function to actually execute the action.
     */
    run?: (worldState: WorldState) => void;
}

export class ActionHelper {
  // static resolve(worldState: WorldState, prop: string) {
  //   switch (prop.toLowerCase()) {
  //     case '$location': return ActionHelper.getLocation(worldState);
  //     default: return null;
  //   }
  // }

  // static getLocation(worldState: WorldState) { return worldState.activeFeatures.geometry; }

}
