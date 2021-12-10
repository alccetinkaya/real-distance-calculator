import { Point } from "../models/point.model";
import { ExcelFileColumn } from "./excel.service";
import { LogServiceInterface } from "./log.service";

export class PointService {
    _pointList: Point[]
    _logServices: LogServiceInterface[]

    constructor(logServices: LogServiceInterface[]) {
        this._pointList = []
        this._logServices = logServices
    }

    errorLog(error: string): void {
        for (const logService of this._logServices) {
            logService.errorLog(error)
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

        if (Number.isNaN(point[ExcelFileColumn.CODE])) {
            this.errorLog("Point code is not a number");
            return false;
        }

        if (Object.prototype.toString.call(point[ExcelFileColumn.NAME]) !== '[object String]') {
            this.errorLog("Point name is not a string");
            return false;
        }

        if (Number.isNaN(ExcelFileColumn.LATITUDE)) {
            this.errorLog("Point latitude is not a number");
            return false;
        }

        if (Number.isNaN(ExcelFileColumn.LONGITUDE)) {
            this.errorLog("Point longitude is not a number");
            return false;
        }

        return true;
    }

    loadPoints(pointList: any[]): Point[] {
        for (const point of pointList) {
            // valide point object
            if (this.validatePoint(point)) {
                // check if point is exist in list
                if (!this._pointList.some(element => element.name === point[ExcelFileColumn.NAME])) {
                    this._pointList.push({
                        code: point[ExcelFileColumn.CODE],
                        name: point[ExcelFileColumn.NAME],
                        latitude: point[ExcelFileColumn.LATITUDE],
                        longitude: point[ExcelFileColumn.LONGITUDE]
                    });
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