import winston = require('winston');
import { Rule, RuleActivationType, IRule } from '../../src/models/Rule';
import { IAction } from '../../src/models/Action';
import { WorldState } from '../../src/models/WorldState';
import { ServiceMock  } from '../mocks/serviceMock';

describe('A Rule', () => {
  let effect = false;
  let action: IAction = {
    method: 'dummy',
    run: () => { return effect = true; }
  };

  let worldState: WorldState;
  let service = new ServiceMock();

  beforeEach(() => {
    effect = false;
    service.isRuleActive = true;
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
      isGeneric: true,
      recurrence: 1,
      activationType: 'OnExit',
      actions: [action]
    });
    rule.process(worldState, service);
    expect(effect).toBeFalsy();
    rule.conditions = [{
      method: 'dummy',
      evaluate: () => { return false; }
    }];
    rule.process(worldState, service);
    expect(effect).toBeTruthy();
  });

  it('should respect OnEnter activation type', () => {
    let rule = new Rule({
      isActive: true,
      isGeneric: true,
      recurrence: 1,
      activationType: 'OnEnter',
      actions: [action]
    });
    rule.process(worldState, service);
    expect(effect).toBeTruthy();
    effect = false;
    rule.conditions = [{
      method: 'dummy',
      evaluate: () => { return false; }
    }];
    rule.process(worldState, service);
    expect(effect).toBeFalsy();
  });

  it('should respect OnChange activation type', () => {
    let rule = new Rule({
      isActive: true,
      isGeneric: true,
      recurrence: 1,
      activationType: 'OnChange',
      actions: [action]
    });
    rule.process(worldState, service);
    expect(effect).toBeTruthy();
    rule.conditions = [{
      method: 'dummy',
      evaluate: () => { return false; }
    }];
    rule.process(worldState, service);
    expect(effect).toBeTruthy();
  });

  it('should respect Continuously activation type', () => {
    let rule = new Rule({
      isActive: true,
      isGeneric: true,
      recurrence: 2,
      activationType: 'Continuously',
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

  it('should respect the rule\'s recurrence', () => {
    let rule = new Rule({
      isActive: true,
      isGeneric: true,
      recurrence: 2,
      activationType: 'Continuously',
      actions: [action]
    });
    rule.process(worldState, service );
    expect(effect).toBeTruthy();
    effect = false;
    rule.process(worldState, service );
    expect(effect).toBeTruthy();
    effect = false;
    expect(service.isRuleActive).toBeFalsy();
    rule.process(worldState, service );
    expect(effect).toBeFalsy();
  });

});
