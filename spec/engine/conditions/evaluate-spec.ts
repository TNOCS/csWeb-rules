import {IWorldState} from '../../../src/models/WorldState';
import {evaluate, createConditionChecker} from '../../../src/engine/conditions/evaluate';

describe('The evaluation of a condition', () => {
  let worldState: IWorldState;

  beforeEach(() => {
    let feature: GeoJSON.Feature<GeoJSON.GeometryObject> = {
      type: 'Feature',
      geometry: {  type: 'Feature', coordinates: [] },
      properties: {}
    };
    worldState = {
      activeFeature: feature
    };
  });

  it('should check simple conditions', () => {
    worldState.activeFeature.properties['speed'] = 75;
    let condition = 'speed > 80';
    let checker = createConditionChecker(condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.activeFeature.properties['speed'] = 85;
    result = checker(worldState);
    expect(result).toBeTruthy();
  });

  it('should check equality', () => {
    worldState.activeFeature.properties['speed'] = 75;
    let condition = 'speed === 80';
    let checker = createConditionChecker(condition);
    let result: boolean;
    result = checker(worldState);
    expect(result).toBeFalsy();
    worldState.activeFeature.properties['speed'] = 80;
    result = checker(worldState);
    expect(result).toBeTruthy();
  });
});