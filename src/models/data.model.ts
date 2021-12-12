import { Point } from "./point.model";

export interface ConfigData {
    mode: string
    apiName: string
    apiKey: string
    cmdInputFileType: string
}

export interface DistanceData {
    value: string;
    measure: string;
}

export interface DurationData {
    value: string;
    measure: string;
}

export interface PrintData {
    originPoint: Point;
    destinationPoint: Point;
    distance: DistanceData;
    duration: DurationData;
}

