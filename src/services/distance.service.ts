import { PrintData } from "../models/data.model";
import { Point } from "../models/point.model";
import { UserInputData, UserInputNames } from "../models/user-input.model";
import { ConfigApiNames, ConfigDirectionNames, ConfigService } from "./config.service";
import { LogServiceInterface } from "./log.service";
import { PrintServiceInterface } from "./print.service";

const googleDistance = require('google-distance-matrix');
const configService: ConfigService = ConfigService.Instance;

export class DistanceService {
    _logServices: LogServiceInterface[];
    _printServices: PrintServiceInterface[];

    constructor(logServices: LogServiceInterface[], printServices: PrintServiceInterface[]) {
        this._logServices = logServices;
        this._printServices = printServices;
    }

    errorLog(error: string) {
        for (const logService of this._logServices) {
            logService.errorLog(error);
        }
    }

    printDistanceData(data: PrintData) {
        for (const printService of this._printServices) {
            printService.printDistanceData(data);
        }
    }

    calculateDistanceTest(origins: Point[], destinations: Point[]) {
        for (const origin of origins) {
            let x1: number = Number(origin.latitude);
            let y1: number = Number(origin.longitude);
            for (const destination of destinations) {
                if (origin.name === destination.name) continue;

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

    testDistanceAPI(origins: Point[], destinations: Point[]) {
        this.calculateDistanceTest(origins, destinations);
        if (configService.getConfigDirection() == ConfigDirectionNames.TWO_WAY) {
            this.calculateDistanceTest(destinations, origins);
        }
    }

    async googleDistanceMatrixSync(origins: string[], destinations: string[]) {
        return new Promise((resolve, reject) => {
            googleDistance.matrix(origins, destinations, (err: any, distances: any) => {
                if (err) {
                    reject(err);
                }

                resolve(distances);
            })
        });
    }

    async calculateDistanceGoogle(origins: Point[], destinations: Point[]) {
        // prepare google origins format
        let googleOrigins: string[] = [];
        origins.forEach(element => {
            googleOrigins.push(`${element.latitude.toString()},${element.longitude.toString()}`);
        });

        // prepare google destinations format
        let googleDestionations: string[] = [];
        destinations.forEach(element => {
            googleDestionations.push(`${element.latitude.toString()},${element.longitude.toString()}`);
        });

        let result: any = await this.googleDistanceMatrixSync(googleOrigins, googleDestionations);
        if (result.errorCode) {
            throw `Calculate distance with Google API error! Code: ${result.errorCode} | Message: ${result.message}`;
        }
        if (result.status !== 'OK') {
            throw `Calculate distance Google API error! Status: ${result.status} | Message: ${result.error_message}`;
        }

        for (let i = 0; i < origins.length; i++) {
            const origin = origins[i];
            for (let j = 0; j < destinations.length; j++) {
                const destination = destinations[j];

                let element = result.rows[i].elements[j];
                if (element.status === 'OK') {
                    if (origin.name === destination.name) continue;

                    if (element.distance.value == 0 || element.duration.value == 0) {
                        this.errorLog(`There is no distance or duration value between ${origin.name} and ${destination.name}`);
                        continue;
                    }

                    let [distance, distanceMeasure]: string = element.distance.text.split(" ");
                    let [duration, durationMeasure]: string = element.duration.text.split(" ");
                    this.printDistanceData({
                        originPoint: origin,
                        destinationPoint: destination,
                        distance: { value: distance, measure: distanceMeasure },
                        duration: { value: duration, measure: durationMeasure }
                    });
                } else {
                    this.errorLog(`${destination.name} is not reachable by land from ${origin.name}`);
                }
            }
        }
    }

    async googleDistanceAPI(userInput: UserInputData, origins: Point[], destinations: Point[]) {
        await this.calculateDistanceGoogle(origins, destinations);
        if (configService.getConfigDirection() == ConfigDirectionNames.TWO_WAY &&
            userInput.originPointSelect === UserInputNames.ALL && userInput.destinationPointSelect === UserInputNames.ALL) {
            await this.calculateDistanceGoogle(destinations, origins);
        }
    }

    async calculate(userInput: UserInputData, origins: Point[], destinations: Point[]) {
        switch (configService.getConfigApiName()) {
            case ConfigApiNames.TEST:
                this.testDistanceAPI(origins, destinations);
                break;
            case ConfigApiNames.GOOGLE:
                googleDistance.key(configService.getConfigApiKey());
                await this.googleDistanceAPI(userInput, origins, destinations);
                break;
            default:
                break;
        }

        return null;
    }
}