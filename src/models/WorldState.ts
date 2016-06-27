import {IFeature, IProperty, IGeoJsonFile} from '../models/Feature';

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
    features: IFeature[] = [];
    /** Imported features, e.g. namespaces */
    imports: { [key: string]: IFeature[] } = {};
    /**
     * Active feature.
     * In case it is undefined, you can only evaluate the non-feature specific rules.
     */
    activeFeature: IFeature;
    /**
     * Active layer id is used for working with features.
     * TODO I assume that later, we need to make this more flexible, allowing you to specify
     * which layer to use.
     */
    activeLayerId: string;
}
