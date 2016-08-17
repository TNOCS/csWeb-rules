import * as turf from 'turf';
import {WorldState, IWorldState}        from '../../models/WorldState';
import {Utils}                          from '../../helpers/Utils';
import {RuleEngine, IRuleEngineService} from '../../engine/RuleEngine';
import {ICondition}                     from '../../models/Condition';

export interface IBoundaryCondition {
  /**
   * Reference to a polygon or multi-polygon ID.
   *
   * @type {string}: Format must be namespace.id
   */
  polyId?: string;
  /**
   * If true, the polygon is defined in an existing source (worldState.features.ns.id,
   * allowing for optimizations in the generated code.
   *
   * @type {boolean}
   */
  static?: boolean;
  /**
   * If provided, use the feature ID instead of the currently active feature.
   *
   * @type {string}: Format must be namespace.id
   */
  featureId?: string;
}

/**
 * Check whether a POINT feature is inside a POLYGON feature.
 *
 * The polyId property is required, and specifies the ID of the POLYGON feature.
 *
 * When the static option is set, it means that we have imported the POLYGON feature,
 * and we can optimize the code a bit.
 *
 * When the featureId property is set, we don't use the worldState's updatedFeature,
 * but an existing feature instead. In this way, we can use it for more complicated
 * scenario's, e.g. check when a feature is inside AREA 1 and another feature is in
 * AREA 2.
 *
 * {
 *   "method": "inside",
 *   "property": {
 *     "polyId": "khasab.harbour",
 *     "featureId": "tracks.uav",
 *     "static": true
 *    }
 * }
 *
 * @export
 * @param {IRuleEngineService} service
 * @param {IBoundaryCondition} data
 * @returns
 */
export function evaluate(service: IRuleEngineService, data: IBoundaryCondition) {
  if (!data || !data.polyId) {
    service.logger.error('Cannot evaluate empty rule!');
    return undefined;
  }
  let nsid = extractNamespaceId(data.polyId);
  if (!nsid) {
    service.logger.error(`Cannot extract namespace and id from polyId ${data.polyId}!`);
    return undefined;
  }
  let ns = nsid.ns;
  let id = nsid.id;

  if (data.featureId) {
    let nsid2 = extractNamespaceId(data.featureId);
    if (!nsid2) {
      service.logger.error(`Cannot extract namespace and id from featureId ${data.featureId}!`);
      return undefined;
    }
    let ns2 = nsid2.ns;
    let id2 = nsid2.id;

    if (data.static) {
      return function (worldState: IWorldState) {
        if (!worldState.features.hasOwnProperty(ns2) || !worldState.features[ns2].hasOwnProperty(id2)) return false;
        let point = <GeoJSON.Feature<GeoJSON.Point>>worldState.features[ns2][id2];
        if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
        let poly = <GeoJSON.Feature<GeoJSON.Polygon>>worldState.features[ns][id];
        return turf.inside(point, poly);
      };
    } else {
      return function (worldState: IWorldState) {
        if (!worldState.features.hasOwnProperty(ns)
        || !worldState.features[ns].hasOwnProperty(id)
        || !worldState.features.hasOwnProperty(ns2)
        || !worldState.features[ns2].hasOwnProperty(id2)) return false;
        let point = <GeoJSON.Feature<GeoJSON.Point>>worldState.features[ns2][id2];
        if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
        let poly = <GeoJSON.Feature<GeoJSON.Polygon>>worldState.features[ns][id];
        return turf.inside(point, poly);
      };
    }
  } else {
    if (data.static) {
      return function (worldState: IWorldState) {
        let point: GeoJSON.Feature<GeoJSON.Point> = <GeoJSON.Feature<GeoJSON.Point>>worldState.updatedFeature;
        if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
        let poly = <GeoJSON.Feature<GeoJSON.Polygon>>worldState.features[ns][id];
        return turf.inside(point, poly);
      };
    } else {
      return function (worldState: IWorldState) {
        if (!worldState.features.hasOwnProperty(ns)
        || !worldState.features[ns].hasOwnProperty(id)) return false;
        let point: GeoJSON.Feature<GeoJSON.Point> = <GeoJSON.Feature<GeoJSON.Point>>worldState.updatedFeature;
        if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
        let poly = <GeoJSON.Feature<GeoJSON.Polygon>>worldState.features[ns][id];
        return turf.inside(point, poly);
      };
    }
  }
}

function extractNamespaceId(nsidStr: string) {
  let nsid = nsidStr.split('.', 2);
  return nsid.length < 2
    ? undefined
    : {
      ns: nsid[0],
      id: nsid[1]
    };
}
