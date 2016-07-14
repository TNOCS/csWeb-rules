import {IBoundingBox} from '../../helpers/Utils';
import {GeoExtenions} from '../../helpers/GeoExtensions';

export interface ISinkConnectorConfig {
    id?: number;
    type: string;
    host?: string;
    port?: number;
    name?: string;
    [key: string]: any;
}

export interface ISinkConnector {
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
     * Connect to the source, and call the callback when new data is available.
     *
     * @param {Function} callback
     */
    connect(callback: (result: any) => void);
}

export class BaseSinkConnector implements ISinkConnector {
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
     * Connect to the source, and call the callback when new data is available.
     *
     * @param {Function} callback
     */
    connect(callback: (result: any) => void) { return; }
}
