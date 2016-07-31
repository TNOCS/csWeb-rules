import {IProperty} from '../models/Feature';

export interface IWorldState {
  /** Time the world state was created */
  startTime?: Date;
  /** The current time */
  currentTime?: Date;
  /** A bag of key-value properties */
  properties?: IProperty[];
  /** List of all features, preceded by a namespace, typically of the source */
  features?: { [ns: string]: { [id: string]: GeoJSON.Feature<GeoJSON.GeometryObject> } };
  /**
   * Active feature.
   * In case it is undefined, you can only evaluate the non-feature specific rules.
   */
  updatedFeature?: GeoJSON.Feature<GeoJSON.GeometryObject>;
}
/**
 * A class representing the world state
 */
export class WorldState implements IWorldState {
  /** Time the world state was created */
  startTime: Date = new Date();
  /** The current time */
  currentTime: Date = this.startTime;
  /** A bag of key-value properties */
  properties: IProperty[] = [];
  /** List of all features, preceded by a namespace, typically of the source */
  features: { [ns: string]: { [id: string]: GeoJSON.Feature<GeoJSON.GeometryObject> } } = {};
  /**
   * Updated or new feature.
   * In case it is undefined, you can only evaluate the non-feature specific rules.
   */
  updatedFeature: GeoJSON.Feature<GeoJSON.GeometryObject>;
}
