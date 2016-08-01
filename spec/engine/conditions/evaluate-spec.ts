import {IWorldState} from '../../../src/models/WorldState';
import {evaluate, createSimpleConditionChecker, normalize, splitAndOr} from '../../../src/engine/conditions/evaluate';

describe('The evaluation of a condition', () => {
  let worldState: IWorldState;

  beforeEach(() => {
    let feature: GeoJSON.Feature<GeoJSON.GeometryObject> = {
      type: 'Feature',
      geometry: {  type: 'Point', coordinates: [] },
      properties: {}
    };
    worldState = {
      updatedFeature: feature
    };
  });

  it('should normalize spaces in a condition', () => {
    expect(normalize('a > 5')).toEqual('a>5');
    expect(normalize('a <= 5')).toEqual('a<=5');
  });

  it('should split AND and OR', () => {
    var str1 = 'a=erik and b_a=15 or type="car"';
    var str2 = 'a4>10 and b<5 or c="erik" and d';
    let str3 = 'speed<=80';
    let group1 = splitAndOr(str1);
    expect(group1.length).toBe(5);
    let group2 = splitAndOr(str2);
    expect(group2.length).toBe(7);
    let group3 = splitAndOr(str3);
    expect(group3.length).toBe(1);
  });

  it('should check simple conditions', () => {
    worldState.updatedFeature.properties['speed'] = 75;
    let condition = 'speed > 80';
    let checker = createSimpleConditionChecker(condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.updatedFeature.properties['speed'] = 85;
    result = checker(worldState);
    expect(result).toBeTruthy();
  });

  it('should check equality', () => {
    worldState.updatedFeature.properties['speed'] = 75;
    let condition = 'speed === 80';
    let checker = createSimpleConditionChecker(condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.updatedFeature.properties['speed'] = 80;
    result = checker(worldState);
    expect(result).toBeTruthy();
  });

  it ('should evaluate simple conditions', () => {
    worldState.updatedFeature.properties['speed'] = 75;
    let condition = 'speed > 80';
    let checker = evaluate(null, condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.updatedFeature.properties['speed'] = 85;
    result = checker(worldState);
    expect(result).toBeTruthy();
  });

  it ('should evaluate one AND condition', () => {
    worldState.updatedFeature.properties['speed'] = 75;
    worldState.updatedFeature.properties['type'] = 'car';
    let condition = 'speed > 80 AND type === "truck" ';
    let checker = evaluate(null, condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.updatedFeature.properties['speed'] = 85;
    worldState.updatedFeature.properties['type'] = 'truck';
    result = checker(worldState);
    expect(result).toBeTruthy();
  });

  it ('should evaluate two AND conditions', () => {
    worldState.updatedFeature.properties['speed'] = 75;
    worldState.updatedFeature.properties['type'] = 'car';
    worldState.updatedFeature.properties['age'] = 10;
    let condition = 'speed > 80 AND type === "truck" AND age <= 12 ';
    let checker = evaluate(null, condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.updatedFeature.properties['speed'] = 85;
    worldState.updatedFeature.properties['type'] = 'truck';
    worldState.updatedFeature.properties['age'] = 12;
    result = checker(worldState);
    expect(result).toBeTruthy();
  });

  it ('should evaluate one AND and one OR conditions', () => {
    worldState.updatedFeature.properties['speed'] = 75;
    worldState.updatedFeature.properties['type'] = 'car';
    worldState.updatedFeature.properties['age'] = 15;
    let condition = 'speed > 80 AND type === "truck" OR age <= 12 ';
    let checker = evaluate(null, condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.updatedFeature.properties['speed'] = 85;
    worldState.updatedFeature.properties['type'] = 'truck';
    worldState.updatedFeature.properties['age'] = 10;
    result = checker(worldState);
    expect(result).toBeTruthy();
  });

  it ('should evaluate two OR conditions', () => {
    worldState.updatedFeature.properties['speed'] = 75;
    worldState.updatedFeature.properties['type'] = 'car';
    worldState.updatedFeature.properties['age'] = 15;
    let condition = 'speed > 80 OR type === "truck" OR age <= 12 ';
    let checker = evaluate(null, condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.updatedFeature.properties['speed'] = 85;
    worldState.updatedFeature.properties['type'] = 'car';
    worldState.updatedFeature.properties['age'] = 15;
    result = checker(worldState);
    expect(result).toBeTruthy();
    worldState.updatedFeature.properties['speed'] = 75;
    worldState.updatedFeature.properties['type'] = 'truck';
    worldState.updatedFeature.properties['age'] = 15;
    result = checker(worldState);
    expect(result).toBeTruthy();
    worldState.updatedFeature.properties['speed'] = 75;
    worldState.updatedFeature.properties['type'] = 'car';
    worldState.updatedFeature.properties['age'] = 10;
    result = checker(worldState);
    expect(result).toBeTruthy();
  });

});