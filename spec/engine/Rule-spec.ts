import winston = require('winston');
import { Rule, RuleActivationType, IRule } from '../../src/models/Rule';
import { IAction } from '../../src/models/Action';
import { WorldState } from '../../src/models/WorldState';

describe('A Rule', () => {
  let effect = false;
  let action: IAction = {
    method: 'dummy',
    run: () => { return effect = true; }
  };

  let worldState: WorldState;
  let service = {
    logger: new winston.Logger(),
    deactivateRule: () => { return; }
  };

  beforeEach(() => {
    effect = false;
    let feature: GeoJSON.Feature<GeoJSON.GeometryObject> = {
      type: 'Feature',
      geometry: {  type: 'Feature', coordinates: [] },
      properties: {}
    };
    worldState = new WorldState();
    worldState.updatedFeature = feature;
  });

  it('should respect OnExit activation type', () => {
    let rule = new Rule({
      isActive: true,
      isGenericRule: true,
      recurrence: 1,
      activationType: RuleActivationType.OnExit,
      actions: [action]
    });
    rule.process(worldState, service );
    expect(effect).toBeFalsy();
    rule.conditions = [{
      method: 'dummy',
      evaluate: () => { return false; }
    }];
    rule.process(worldState, service );
    expect(effect).toBeTruthy();
  });

  it('should respect OnEnter activation type', () => {
    let rule = new Rule({
      isActive: true,
      isGenericRule: true,
      recurrence: 1,
      activationType: RuleActivationType.OnEnter,
      actions: [action]
    });
    rule.process(worldState, service );
    expect(effect).toBeTruthy();
    effect = false;
    rule.conditions = [{
      method: 'dummy',
      evaluate: () => { return false; }
    }];
    rule.process(worldState, service );
    expect(effect).toBeFalsy();
  });

  it('should respect Continuously activation type', () => {
    let rule = new Rule({
      isActive: true,
      isGenericRule: true,
      recurrence: 2,
      activationType: RuleActivationType.Continuously,
      actions: [action]
    });
    rule.process(worldState, service );
    expect(effect).toBeTruthy();
    effect = false;
    rule.process(worldState, service );
    expect(effect).toBeTruthy();
    effect = false;
    rule.conditions = [{
      method: 'dummy',
      evaluate: () => { return false; }
    }];
    rule.process(worldState, service );
    expect(effect).toBeFalsy();
  });

});