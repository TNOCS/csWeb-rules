import {IFeature, IGeoJsonFile} from '../models/Feature';
import {IBoundingBox} from '../helpers/Utils';

export interface IConnector {
    /**
     * Return all features.
     *
     * @returns {IFeature[]}
     */
    getFeatures(): IFeature[];

    /**
     * Return all features within the bounding box.
     *
     * @param {IBoundingBox} bbox
     * @returns {IFeature[]}
     */
    getFeaturesInBoundingBox(bbox: IBoundingBox): IFeature[];
}

export class BaseConnector implements IConnector {
    private features: IFeature[] = [];

    /**
     * Return all features.
     *
     * @returns {IFeature[]}
     */
    getFeatures() { return this.features; }

    /**
     * Return all features within the bounding box.
     *
     * @param {IBoundingBox} bbox
     * @returns {IFeature[]}
     */
    getFeaturesInBoundingBox(bbox: IBoundingBox) {
        let foundFeatures: IFeature[] = [];
        this.features.forEach(f => {

        });
        return foundFeatures;
    }
}
