import {IWorldState} from '../../../src/models/WorldState';
import {evaluate, IBoundaryCondition} from '../../../src/engine/conditions/inside';
import { ServiceMock } from '../../mocks/serviceMock';

describe('Inside condition', () => {
  let worldState: IWorldState;
  let data: IBoundaryCondition;
  let service = new ServiceMock();
  let polyFeature: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0]
      ]]
    },
    properties: {}
  };
  let otherPolyFeature: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [3, 3],
        [13, 3],
        [13, 13],
        [3, 13],
        [3, 3]
      ]]
    },
    properties: {}
  };
  let inside: GeoJSON.Feature<GeoJSON.Point> = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [5, 5]
    },
    properties: {}
  };
  let outside: GeoJSON.Feature<GeoJSON.Point> = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [15, 15]
    },
    properties: {}
  };

  beforeEach(() => {
    data = {
      polyId: 'areas.nai'
    };
    worldState = {
      features: {
        'areas': {
          'nai': polyFeature
        }
      }
    };
  });

  it('should fail undefined data', () => {
    let conditionChecker = evaluate(service, null);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail undefined polyIds', () => {
    data.polyId = '';
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail badly defined polyIds', () => {
    data.polyId = 'areasnais';
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail non-existing polyIds', () => {
    worldState.updatedFeature = inside;
    data.polyId = 'areas.unknownNais';
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeFalsy();
  });

  it('should recognize points inside the area', () => {
    worldState.updatedFeature = inside;
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeTruthy();
    data.static = true;
    conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeTruthy();
  });

  it('should recognize points outside the area', () => {
    worldState.updatedFeature = outside;
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeFalsy();
    data.static = true;
    conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeFalsy();
  });

  it('should fail non-point features', () => {
    worldState.updatedFeature = otherPolyFeature;
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeFalsy();
    data.static = true;
    conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeFalsy();
  });

});