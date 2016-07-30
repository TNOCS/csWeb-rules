import {WorldState, IWorldState}        from '../../models/WorldState';
import {Utils}                          from '../../helpers/Utils';
import {RuleEngine, IRuleEngineService} from '../../engine/RuleEngine';
import {ICondition}                     from '../../models/Condition';


export function evaluate(service: IRuleEngineService, data: string) {
  if (!data) return null;

  let condition = normalize(data);
  let conditions = splitAndOr(condition);
  if (conditions.length === 1) return createSimpleConditionChecker(conditions[0]);

  let andConditions: Function[][] = [];
  let index = 0;
  andConditions[index] = [];
  conditions.forEach(c => {
    switch (c) {
      case 'AND':
      case 'and': break;
      case 'OR':
      case 'or':
        andConditions[++index] = [];
        break;
      default:
        andConditions[index].push(createSimpleConditionChecker(c));
        break;
    }
  });

  return function (worldState: WorldState) {
    let allAndConditionsFulfilled = true;
    andConditions.some(ac => {
      allAndConditionsFulfilled = true;
      ac.some(c => {
        if (c(worldState)) return false;
        allAndConditionsFulfilled = false;
        return true;
      });
      return allAndConditionsFulfilled;
    });
    return allAndConditionsFulfilled;
  };
}

export function normalize(condition: string) {
  const re = /\s*([=><]{1,3})\s*/gi;
  const subst = '$1';
  return condition.replace(re, subst);
}

// export function splitAndOrParentheses(condition: string) {
//   const re = /\(\s*([\w\.'_<>=]+)\s+(and|or)\s+([\w\.'_<>=])\s*\)|([\w\.'_<>=]+)/gmi;
//   let m, group = [];
//   while ((m = re.exec(condition)) !== null) {
//     if (m.index === re.lastIndex) {
//       re.lastIndex++;
//     }
//     if (m[4]) {
//       group.push(m[4]);
//     } else {
//       group.push(m.splice(1, 3));
//     }
//     console.log(m);
//   }
//   // console.log(group);
// }

/**
 * Split each condition and the AND and OR instructions.
 *
 * @export
 * @param {string} condition
 * @returns
 */
export function splitAndOr(condition: string) {
  const re = /\s+(and|or)\s+|([\w_>=<\'\"\.]*)?/gi;
  let m, group: string[] = [];

  while ((m = re.exec(condition)) !== null) {
    if (m.index === re.lastIndex) {
      re.lastIndex++;
    }
    let match = m[1] || m[0];
    if (match) group.push(match);
  }
  return group;
}

/**
 * Returns an AND or OR condition checker.
 *
 * @export
 * @param {string[]} condition: simpleCondition, AND or OR, simpleCondition
 */
export function createAndOrChecker(condition: string[]) {
  if (condition.length !== 3) throw new Error('Cannot create ')
  switch (condition[1]) { }
}

/**
 * Creates a function that checks a simple condition, e.g. speed >= 80.
 *
 * @export
 * @param {string} condition
 * @returns
 */
export function createSimpleConditionChecker(condition: string) {
  const re = /^\s*([\w\d_-]+)\s*(<=|<|>=|>|={1,3})?\s*'?"?([\w\d_]+)?'?"?\s*$/gi;

  let match = re.exec(condition);
  let property = match[1];
  if (match.length === 4) {
    let operator = match[2];
    let value = match[3];
    switch (operator) {
      case '===':
      case '==':
      case '=': return function (worldState: IWorldState) {
        let f = worldState.updatedFeature;
        return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] == value;
      };
      case '<': return function (worldState: IWorldState) {
        let f = worldState.updatedFeature;
        return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] < value;
      };
      case '>': return function (worldState: IWorldState) {
        let f = worldState.updatedFeature;
        return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] > value;
      };
      case '<=': return function (worldState: IWorldState) {
        let f = worldState.updatedFeature;
        return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] <= value;
      };
      case '>=': return function (worldState: IWorldState) {
        let f = worldState.updatedFeature;
        return f && f.properties && f.properties.hasOwnProperty(property) && f.properties[property] >= value;
      };
    }
  } else if (match.length === 2) {
    // Check for the exisience of a property
    return function (worldState: IWorldState) {
      let f = worldState.updatedFeature;
      return f && f.properties && f.properties.hasOwnProperty(property);
    };
  }
  return function (worldState: IWorldState) { return false; };
}
