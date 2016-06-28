import * as turf from 'turf';
import {IFeature, IGeoJsonFile} from '../models/Feature';

export class GeoExtenions {
    static getBoundingBox(features: IFeature[]) {
    var bounds: any = {}, coords, point, latitude, longitude;

    // // Loop through each “feature”
    // for (var i = 0; i < features.length; i++) {
    //     // get bound
    //     if (!features[i].hasOwnProperty('geometry')) continue;
    //     var b = d3.geo.bounds(features[i]);
    //     // Update the bounds recursively by comparing the current
    //     // xMin/xMax and yMin/yMax with the coordinate
    //     // we're currently checking
    //     bounds.xMin = bounds.xMin < b[0][0] ? bounds.xMin : b[0][0];
    //     bounds.xMax = bounds.xMax > b[1][0] ? bounds.xMax : b[1][0];
    //     bounds.yMin = bounds.yMin < b[0][1] ? bounds.yMin : b[0][1];
    //     bounds.yMax = bounds.yMax > b[1][1] ? bounds.yMax : b[1][1];
    // }
    // bounds.southWest = [bounds.yMin, bounds.xMin];
    // bounds.northEast = [bounds.yMax, bounds.xMax];

    // // Returns an object that contains the bounds of this GeoJSON
    // // data. The keys of this object describe a box formed by the
    // // northwest (xMin, yMin) and southeast (xMax, yMax) coordinates.
    return bounds;
}

}
