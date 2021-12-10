import { DistanceData } from "../models/data.model";
import { Point } from "../models/point.model";
import { ConfigApiNames, ConfigService } from "./config.service";
//const googleDistanceAPI = require('google-distance-matrix');

export class DistanceService {

    testDistanceAPI(origins: Point[], destinations: Point[]): DistanceData[] {
        let distanceList: DistanceData[] = [];

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
                distanceList.push({ originPoint: origin, destinationPoint: destination, distance: distance.toFixed(2) + " km", duration: duration.toFixed(2) + " mins" })
            }
        }

        return distanceList;
    }

    async calculate(origins: Point[], destinations: Point[]): Promise<DistanceData[]> {
        switch (ConfigService.Instance.getConfigApiName()) {
            case ConfigApiNames.TEST:
                return this.testDistanceAPI(origins, destinations);
            case ConfigApiNames.GOOGLE:
                //googleDistanceAPI.key(ConfigService.Instance.getConfigApiKey());
                break;
            default:
                break;
        }

        return null;
    }
}