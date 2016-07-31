import {IBoundingBox} from '../../helpers/Utils';
import {GeoExtenions} from '../../helpers/GeoExtensions';

export interface ISourceConnectorConfig {
    type: string;
    host?: string;
    port?: number;
    /** Which property should we use to name the feature. */
    referenceId?: string;
    /** Refresh interval for the source in [msec]. */
    refreshInterval?: number;
    [key: string]: any;
}

export interface ISourceConnector {
    /**
     * True in case of an error.
     *
     * @type {boolean}
     */
    hasError: boolean;

    /**
     * In case of an error, returns the error message;
     *
     * @type {string}
     */
    errorStatus: string;

    /**
     * Return all features.
     *
     * @returns {IFeature[]}
     */
    getFeatures(): GeoJSON.Feature<GeoJSON.GeometryObject>[];

    /**
     * Return all point features within the bounding box.
     *
     * @param {IFeature} boundary
     * @returns IFeature[]
     */
    getFeaturesInBoundingBox(boundary: GeoJSON.Feature<GeoJSON.Polygon>): GeoJSON.Feature<GeoJSON.GeometryObject>[];

    /**
     * Connect to the source, and call the callback when new data is available.
     *
     * @param {Function} callback
     */
    connect(callback: (result: any) => void);
}

export class BaseSourceConnector implements ISourceConnector {
    private features: GeoJSON.Feature<GeoJSON.GeometryObject>[] = [];

    /**
     * True in case of an error.
     *
     * @type {boolean}
     */
    hasError = false;

    /**
     * In case of an error, returns the error message;
     *
     * @type {string}
     */
    errorStatus: string;

    /**
     * Return all features.
     *
     * @returns {IFeature[]}
     */
    getFeatures() { return this.features; }

    /**
     * Return all features within the bounding box.
     *
     * @param {IFeature} boundary
     * @returns IFeature[]
     */
    getFeaturesInBoundingBox(boundary: GeoJSON.Feature<GeoJSON.Polygon>) {
        return GeoExtenions.inside(this.features, boundary);
    }

    /**
     * Connect to the source, and call the callback when new data is available.
     *
     * @param {Function} callback
     */
    connect(callback: (result: any) => void) { return; }
}
