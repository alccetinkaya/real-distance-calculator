import { Point } from "../models/point.model";
import { LogServiceInterface } from "./log.service";

export enum PointParams {
    CODE = 0,
    NAME = 1,
    LATITUDE = 2,
    LONGITUDE = 3
}

export class PointService {
    _pointList: Point[];
    _logServices: LogServiceInterface[];

    constructor(logServices: LogServiceInterface[]) {
        this._pointList = [];
        this._logServices = logServices;
    }

    errorLog(error: string): void {
        for (const logService of this._logServices) {
            logService.errorLog(error)
        }
    }

    warnLog(warning: string): void {
        for (const logService of this._logServices) {
            logService.warnLog(warning)
        }       
    }

    infoLog(info: string): void {
        for (const logService of this._logServices) {
            logService.infoLog(info)
        }
    }

    validatePoint(point: any): boolean {
        let valueErr = false;

        Object.values(point).forEach(element => {
            if (element === null || element === undefined) {
                valueErr = true;
                this.errorLog("Point doesn't have one of requirement fields");
            }
        });
        if (valueErr) return false;

        if (typeof point[PointParams.CODE] !== 'number') {
            this.errorLog(point[PointParams.NAME] + " point code is not a number");
            return false;
        }

        if (typeof point[PointParams.NAME] !== 'string') {
            this.errorLog(point[PointParams.NAME] + " point name is not a string");
            return false;
        }

        if (typeof point[PointParams.LATITUDE] !== 'number') {
            this.errorLog(point[PointParams.NAME] + " point latitude is not a number");
            return false;
        }

        if (typeof point[PointParams.LONGITUDE] !== 'number') {
            this.errorLog(point[PointParams.NAME] + " point longitude is not a number");
            return false;
        }

        return true;
    }

    loadPoints(pointList: any[]): Point[] {
        for (const point of pointList) {
            // valide point object
            if (this.validatePoint(point)) {
                // check if point is exist in list
                if (!this._pointList.some(element => element.name === point[PointParams.NAME])) {
                    this._pointList.push({
                        code: point[PointParams.CODE],
                        name: point[PointParams.NAME],
                        latitude: point[PointParams.LATITUDE],
                        longitude: point[PointParams.LONGITUDE]
                    });
                } else {
                    this.warnLog(`There are multiple identical point names for ${point[PointParams.NAME]}`);
                }
            }
        }

        return this._pointList;
    }

    getPointCodeIndex(code: number): number {
        let codeList: number[] = this._pointList.map(item => item.code)
        return codeList.indexOf(code);
    }

    getPointByIndex(index: number): Point {
        return this._pointList[index];
    }

    getPointByCode(code: number): Point {
        let index: number = this.getPointCodeIndex(code);
        if (index === -1) {
            this.errorLog("Point code couldn't find in point list")
            return null
        }
        
        return this.getPointByIndex(index);
    }

}