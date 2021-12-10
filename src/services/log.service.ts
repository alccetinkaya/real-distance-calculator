import { DistanceData } from "../models/data.model"

export interface LogServiceInterface {
    errorLog(error: string): void
    printDistanceData(data: DistanceData[]): void
}

export class ConsoleLogService implements LogServiceInterface {
    errorLog(error: string): void {
        console.log(error)
    }

    printDistanceData(data: DistanceData[]): void {
        for (const distanceData of data) {
            console.log(`${distanceData.originPoint.name.padEnd(25)} -> ${distanceData.destinationPoint.name.padEnd(25)} || Distance: ${distanceData.distance.padEnd(15)} Duration: ${distanceData.duration}`);
        }
    }
}