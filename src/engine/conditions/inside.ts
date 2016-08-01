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
   * If true, the polygon is static, allowing for optimizations
   * in the generated code.
   *
   * @type {boolean}
   */
  static?: boolean;
}

export function evaluate(service: IRuleEngineService, data: IBoundaryCondition) {
  if (!data || !data.polyId) {
    service.logger.error('Cannot evaluate empty rule!');
    return undefined;
  }
  let nsid = data.polyId.split('.', 2);
  if (nsid.length < 2) {
    service.logger.error(`Cannot extract namespace and id from polyId ${data.polyId}!`);
    return undefined;
  }
  let ns = nsid[0];
  let id = nsid[1];

  if (data.static) {
    return function (worldState: IWorldState) {
      let point: GeoJSON.Feature<GeoJSON.Point> = <GeoJSON.Feature<GeoJSON.Point>>worldState.updatedFeature;
      if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
      let poly = <GeoJSON.Feature<GeoJSON.Polygon>>worldState.features[ns][id];
      return turf.inside(point, poly);
    };
  }

  return function (worldState: IWorldState) {
    let point: GeoJSON.Feature<GeoJSON.Point> = <GeoJSON.Feature<GeoJSON.Point>>worldState.updatedFeature;
    if (!point || !point.geometry || point.geometry.type !== 'Point') return false;
    if (!worldState.features.hasOwnProperty(ns)) return false;
    let source = worldState.features[ns];
    if (!source.hasOwnProperty(id)) return false;
    let poly = <GeoJSON.Feature<GeoJSON.Polygon>>source[id];
    return turf.inside(point, poly);
  };
}
