import {IProperty} from '../models/Feature';

/**
 * A class representing the world state
 */
export class WorldState {
    /** Time the world state was created */
    startTime: Date = new Date();
    /** The current time */
    currentTime: Date = this.startTime;
    /** A bag of key-value properties */
    properties: IProperty[] = [];
    /** List of all features */
    features: GeoJSON.Feature<GeoJSON.GeometryObject>[] = [];
    /** Imported features, e.g. namespaces */
    imports: { [key: string]: { [key: string]: GeoJSON.Feature<GeoJSON.GeometryObject>} } = {};
    /**
     * Active feature.
     * In case it is undefined, you can only evaluate the non-feature specific rules.
     */
    activeFeature: GeoJSON.Feature<GeoJSON.GeometryObject>;
    /**
     * Active layer id is used for working with features.
     * TODO I assume that later, we need to make this more flexible, allowing you to specify
     * which layer to use.
     */
    activeLayerId: string;
}
