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
      coordinates: [15, 15]
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

  it('should fail undefined polyIds', () => {
    data.locationId = '';
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail badly defined polyIds', () => {
    data.polyId = 'areasnais';
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker).toBeUndefined();
  });

  it('should fail non-existing polyIds', () => {
    worldState.updatedFeature = referenceLocation;
    data.polyId = 'areas.unknownNais';
    let conditionChecker = evaluate(service, data);
    expect(conditionChecker(worldState)).toBeFalsy();
  });

});