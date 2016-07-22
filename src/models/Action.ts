import {WorldState} from './WorldState';
import {RuleEngine, IRuleEngineService} from '../engine/RuleEngine';

export interface IAction {
    method: string;
    property?: Object;
    delay?: number;
    run?: (worldState: WorldState, service: IRuleEngineService, data?: any) => void;
}

export interface IAction {
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
