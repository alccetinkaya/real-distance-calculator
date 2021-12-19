import { UserInputNames } from "../services/user-input.service";
import { Point } from "./point.model";

export interface ConfigData {
    mode: string
    apiName: string
    apiKey: string
    direction: string;
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

export interface UserInputData {
    originFileName: string;
    originPointSelect: UserInputNames;
    originPointLen: number;
    destinationFileName: string;
    destinationPointSelect: UserInputNames;
    destinationPointLen: number;
    departureTime_DD_MM_YYYY: string;
    departureTime_HH_MM: string;
    departureEpochTime: number;
    outputFileName: string;
}