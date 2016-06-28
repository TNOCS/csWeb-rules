export interface IProperty {
    [key: string]: any; //string | number | boolean;
}

export interface IFeature {
    id?:          string;
    index:        number;
    layerId:      string;
    layer:        csComp.Services.ProjectLayer;
    type:         string;
    geometry:     IGeoJsonGeometry;
    properties?:  IProperty;
    lastUpdated?: number;
    sensors?:     { [id: string]: any[] };
    timestamps?:  number[]; //epoch timestamps for sensor data or coordinates (replaces timestamps in layer, if all features use same timestamps recom. to use layer timestamps
}

export interface IGeoJsonGeometry {
    type: string;
    coordinates: Array<number> | Array<Array<number>> | Array<Array<Array<number>>>
}

export interface IGeoJsonFile {
    type: string;
    features: Array<IFeature>;
}

export interface IGeoJsonCollection {
    [key: string]: IGeoJsonFile;
}
