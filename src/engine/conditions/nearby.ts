import * as turf from 'turf';
import {WorldState, IWorldState}        from '../../models/WorldState';
import {Utils}                          from '../../helpers/Utils';
import {RuleEngine, IRuleEngineService} from '../../engine/RuleEngine';
import {ICondition}                     from '../../models/Condition';

export type Unit = 'kilometers' | 'miles' | 'radians' | 'degrees';

export interface INearbyCondition {
  /**
   * Distance to the reference location in units.
   *
   * @type {number}
   */
  distance: number;
  /**
   * Location as [latitude, longitude] on the map
   *
   * @type {number[]}
   */
  locationLatLng?: number[];
  /**
   * ID of another feature.
   *
   * @type {string}
   */
  locationId?: string;
  /**
   * If true, the polygon is static, allowing for optimizations
   * in the generated code.
   *
   * @type {boolean}
   */
  static?: boolean;
  /**
   * How accurate should the check be in units.
   *
   * @type {number}
   */
  accuracy?: number;
  /**
   * Specify the units used for accuracy and distance.
   *
   * @type {Unit}
   */
  units?: Unit;
}

/**
 * Check whether one point is near another point on the map.
 * The reference point can be either specified as a static location,
 * or alternatively, as a reference to another feature.
 *
 * @export
 * @param {IRuleEngineService} service
 * @param {IBoundaryCondition} data
 * @returns
 */
export function evaluate(service: IRuleEngineService, data: INearbyCondition) {
  if (!data || !data.distance) {
    service.logger.error('Cannot evaluate empty rule or missing distance property!');
    return undefined;
  }

  let units: Unit = data.units ? data.units : 'kilometers';

  if (data.locationId) {
    let nsid = data.locationId.split('.', 2);
    if (nsid.length < 2) {
      service.logger.error(`Cannot extract namespace and id from locationId ${data.locationId}!`);
      return undefined;
    }
    let ns = nsid[0];
    let id = nsid[1];

    if (data.static) {
      return function (worldState: IWorldState) {
        let point: GeoJSON.Feature<GeoJSON.Point> = <GeoJSON.Feature<GeoJSON.Point>>worldState.updatedFeature;
        if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
        let refLocation = <GeoJSON.Feature<GeoJSON.Point>>worldState.features[ns][id];
        return turf.distance(point, refLocation, units) <= data.distance;
      };
    } else {
      return function (worldState: IWorldState) {
        let point: GeoJSON.Feature<GeoJSON.Point> = <GeoJSON.Feature<GeoJSON.Point>>worldState.updatedFeature;
        if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
        if (!worldState.features.hasOwnProperty(ns)) return false;
        let source = worldState.features[ns];
        if (!source.hasOwnProperty(id)) return false;
        let refLocation = <GeoJSON.Feature<GeoJSON.Point>>source[id];
        return turf.distance(point, refLocation, units) <= data.distance;
      };
    }
  }

  if (data.locationLatLng) {
    if (data.locationLatLng.length !== 2) {
      service.logger.error(`Cannot parse locationLatLng as [lat, lng]: ${data.locationLatLng}!`);
      return undefined;
    }
    let refLocation: GeoJSON.Feature<GeoJSON.Point> = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: data.locationLatLng
      },
      properties: {}
    }
    return function (worldState: IWorldState) {
      let point: GeoJSON.Feature<GeoJSON.Point> = <GeoJSON.Feature<GeoJSON.Point>>worldState.updatedFeature;
      if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
      return turf.distance(point, refLocation, units) <= data.distance;
    };
  }

  return undefined;
}
