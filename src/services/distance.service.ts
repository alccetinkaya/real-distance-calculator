import { PrintData } from "../models/data.model";
import { Point } from "../models/point.model";
import { ConfigApiNames, ConfigService } from "./config.service";
import { PrintServiceInterface } from "./print.service";
//const googleDistanceAPI = require('google-distance-matrix');

export class DistanceService {
    _printServices: PrintServiceInterface[];

    constructor(printServices: PrintServiceInterface[]) {
        this._printServices = printServices;
    }

    printDistanceData(data: PrintData) {
        for (const printService of this._printServices) {
            printService.printDistanceData(data);
        }
    }

    testDistanceAPI(origins: Point[], destinations: Point[]) {

        for (const origin of origins) {
            let x1: number = Number(origin.latitude);
            let y1: number = Number(origin.longitude);

            for (const destination of destinations) {
                // check if origin and destination are same
                if (origin === destination) continue;
                let x2: number = Number(destination.latitude);
                let y2: number = Number(destination.longitude);

                let distance: number = Math.sqrt((Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))) * 111;
                let duration: number = distance / 50;

                this.printDistanceData({
                    originPoint: origin,
                    destinationPoint: destination,
                    distance: { value: distance.toFixed(2), measure: "km" },
                    duration: { value: duration.toFixed(2), measure: "min" }
                });
            }
        }
    }

    async calculate(origins: Point[], destinations: Point[]) {
        switch (ConfigService.Instance.getConfigApiName()) {
            case ConfigApiNames.TEST:
                this.testDistanceAPI(origins, destinations);
            case ConfigApiNames.GOOGLE:
                //googleDistanceAPI.key(ConfigService.Instance.getConfigApiKey());
                break;
            default:
                break;
        }

        return null;
    }
}