import * as turf from 'turf';

export class GeoExtenions {
    /**
     * Return the bounding box envelope of all features
     *
     * @static
     * @param {IFeature[]} features
     * @returns Feature<Polygon>: a rectangular Polygon feature that encompasses all vertices
     */
    static getBoundingBox(features: GeoJSON.Feature<GeoJSON.GeometryObject>[]) {
        let fc: GeoJSON.FeatureCollection<GeoJSON.GeometryObject> = {
            type: 'FeatureCollection',
            features: features
        };
        return turf.envelope(fc);
    }

    /**
     * Returns whether the feature is inside or not.
     *
     * @static
     * @param {GeoJSON.Feature<GeoJSON.Point>} feature
     * @param {GeoJSON.Feature<GeoJSON.Polygon>} boundary
     * @returns boolean
     */
    static isInside(feature: GeoJSON.Feature<GeoJSON.Point>, boundary: GeoJSON.Feature<GeoJSON.Polygon>) {
        return turf.inside(feature, boundary);
    }

    /**
     * Return all the points inside a (multi-)polygon boundary.
     * NOTE: Non point features are ignored.
     *
     * @static
     * @param {IFeature[]} features
     * @param {IFeature} boundary
     * @returns all the Point Features inside the boundary.
      */
    static inside(features: GeoJSON.Feature<GeoJSON.GeometryObject>[], boundary: GeoJSON.Feature<GeoJSON.Polygon>) {
        let insideFeatures: GeoJSON.Feature<GeoJSON.Point>[] = [];

        features.forEach(f => {
            if (f.hasOwnProperty('geometry') && f.geometry.type !== 'Point') return;
            let pointFeature: GeoJSON.Feature<GeoJSON.Point> = <GeoJSON.Feature<GeoJSON.Point>>f;
            if (turf.inside(pointFeature, boundary)) insideFeatures.push(pointFeature);
        });
        return insideFeatures;
    }

}
