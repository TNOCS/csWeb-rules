import {WorldState, IWorldState}        from '../../models/WorldState';
import {IAction, ActionHelper}          from '../../models/Action';
import {Utils}                          from '../../helpers/Utils';
import {RuleEngine, IRuleEngineService} from '../../engine/RuleEngine';

export interface IEvaluateCondition {
  property?: string;
  operator?: string;
  value?: string | number | Date;
}

export function evaluate(service: IRuleEngineService, data: string) {

  if (!data) return null;

  return function (worldState: WorldState) {
  };
}

export function createConditionChecker(condition: string) {
  const re = /^\s*f.([\w\d_-]+)\s*(<=|<|>=|>|={1,3})?\s*'?([\w\d_]+)?'?\s*$/gi;

  let match = re.exec(condition);
  let property = match[1];
  if (match.length === 4) {
    let operator = match[2];
    let value = match[3];
    switch (operator) {
      case '===':
      case '==':
      case '=': return function (worldState: IWorldState) {
          let f = worldState.activeFeature;
          return f && f.properties && f.hasOwnProperty(property) && f.properties[property] === value;
        };
      case '<': return function (worldState: IWorldState) {
          let f = worldState.activeFeature;
          return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] < value;
        };
      case '>': return function (worldState: IWorldState) {
          let f = worldState.activeFeature;
          return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] > value;
        };
      case '<=': return function (worldState: IWorldState) {
          let f = worldState.activeFeature;
          return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] <= value;
        };
      case '>=': return function (worldState: IWorldState) {
          let f = worldState.activeFeature;
          return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] >= value;
        };
    }
  } else if (match.length === 2) {
    // Check for the exisience of a property
    return function (worldState: IWorldState) {
      let f = worldState.activeFeature;
      return f && f.properties && f.properties.hasOwnProperty(property);
    };
  }
  return function (worldState: IWorldState) { return false; };
}
