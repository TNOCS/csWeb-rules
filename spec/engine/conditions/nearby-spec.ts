import {IWorldState} from '../../../src/models/WorldState';
import {evaluate, INearbyCondition} from '../../../src/engine/conditions/nearby';
import {ServiceMock} from '../../mocks/serviceMock';

describe('Inside condition', () => {
  let worldState: IWorldState;
  let data: INearbyCondition;
  let service = new ServiceMock();
  let referenceLocation: GeoJSON.Feature<GeoJSON.Point> = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [5, 5]
    },
    properties: {}
  };
  let feature: GeoJSON.Feature<GeoJSON.Point> = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [14, 5]
    },
    properties: {}
  };

  beforeEach(() => {
    data = {
      locationId: 'areas.location',
      distance: 10
    };
    worldState = {
      features: {
        'areas': {
          'location': referenceLocation
        }
      }
    };
  });

  it('should fail undefined data', () => {
    let conditionChecker = evaluate(service, null);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail undefined distance', () => {
    data.distance = undefined;
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail badly defined locationLatLng', () => {
    data.locationId = undefined;
    data.locationLatLng = [1, 2, 3];
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail badly defined locationId', () => {
    data.locationId = 'areaslocation';
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail non-existing locationId', () => {
    data.locationId = 'areas.locationUnknown';
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeFalsy();
  });

  it('should check the nearness for locationId', () => {
    data.locationId = 'areas.location';
    data.units = 'degrees';
    worldState.updatedFeature = feature;
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeTruthy();
    feature.geometry.coordinates = [16, 5];
    expect(conditionChecker(worldState)).toBeFalsy();
  });

  it('should check the nearness for locationLatLng', () => {
    data.locationId = undefined;
    data.locationLatLng = [5, 5];
    data.units = 'degrees';
    worldState.updatedFeature = feature;
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeTruthy();
    feature.geometry.coordinates = [16, 5];
    expect(conditionChecker(worldState)).toBeFalsy();
  });

});