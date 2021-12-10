import { Point } from "./point.model";

export interface ConfigData {
    mode: string
    apiName: string
    apiKey: string
    cmdInputFileType: string
}

export interface PrintData {
    originCode: number;
    originName: string;
    destCode: number;
    destName: string;
    distance: string;
    duration: string;
}

export interface DistanceData {
    originPoint: Point;
    destinationPoint: Point;
    distance: string;
    duration: string;
}