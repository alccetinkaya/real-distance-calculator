import { DistanceData } from "../models/data.model";
import { Point } from "../models/point.model";
import { CmdInputFileTypes } from "../services/config.service";
import { DistanceService } from "../services/distance.service";
import { ExcelService } from "../services/excel.service";
import { LogServiceInterface } from "../services/log.service";
import { PointService } from "../services/point.service";
import { exit, getPromptResult } from "../utilities";

let promptResultStr: string;
let promptResultNum: number;

export class CmdHandler {
    _inputFileType: string = null;
    _logServices: LogServiceInterface[] = [];

    constructor(inputFileType: string, logServices: LogServiceInterface[]) {
        this._inputFileType = inputFileType;
        this._logServices = logServices;
    }

    errorLog(error: string) {
        for (const logService of this._logServices) {
            logService.errorLog(error);
        }
    }

    printDistanceData(data: DistanceData[]) {
        for (const logService of this._logServices) {
            logService.printDistanceData(data);
        }
    }

    async inputExcelFileHandler(excelFile: any): Promise<Point[]> {
        let points: any[];
        try {
            points = await new ExcelService().readPointsFromExcelFileSync(excelFile);
        } catch (error) {
            this.errorLog(`Read excel file => ${error}`);
            return null;
        }

        // check points length
        if (points.length < 2) {
            this.errorLog(`${excelFile} file doesn't have at least 2 rows`);
            return null;
        }

        return new PointService(this._logServices).loadPoints(points);
    }

    async inputJsonFileHandler(jsonFile: string): Promise<Point[]> {
        let points: Point[];
        return points;
    }

    async inputFileHandler(inputFile: string): Promise<Point[]> {
        switch (this._inputFileType) {
            case CmdInputFileTypes.EXCEL:
                return await this.inputExcelFileHandler(inputFile);
            case CmdInputFileTypes.JSON:
                return await this.inputJsonFileHandler(inputFile);
            default:
                return null;
        }
    }

    async originPointHandler(points: Point[]): Promise<Point[]> {
        promptResultStr = '';
        while (promptResultStr !== "one" && promptResultStr !== "all") {
            promptResultStr = await getPromptResult<string>({
                type: "text",
                message: "Do you want to calculate distance for all origin points or one specific origin point? (all/one): "
            });
        }

        // handle one origin point
        if (promptResultStr === "one") {
            // print point list to user
            points.forEach((point, i) => {
                console.log(`${(i + 1).toString().padEnd(3)} : ${point.code.toString().padEnd(6)} ${point.name.toString().padEnd(25)}`);
            });
            promptResultNum = null;
            while (promptResultNum < 1 || promptResultNum > points.length) {
                promptResultNum = await getPromptResult<number>({
                    type: "number",
                    message: `Please select origin point number between 1 and ${points.length}: `
                });
            }

            let originPoint: Point = points[promptResultNum - 1];
            console.log(`${originPoint.name} was selected as origin point...`)
            return [originPoint];
        }

        // handle all origin points
        if (promptResultStr === "all") {
            console.log(`All points were selected as origin points...`)
            return points;
        }

        return null;
    }

    async destinationPointHandler(points: Point[]): Promise<Point[]> {
        promptResultStr = '';
        while (promptResultStr !== "one" && promptResultStr !== "all") {
            promptResultStr = await getPromptResult<string>({
                type: "text",
                message: "Do you want to calculate distance for all destination points or one specific destination point? (all/one): "
            });
        }

        // handle one destination point
        if (promptResultStr === "one") {
            // print point list to user
            points.forEach((point, i) => {
                console.log(`${(i + 1).toString().padEnd(3)} : ${point.code.toString().padEnd(6)} ${point.name.toString().padEnd(25)}`);
            });
            promptResultNum = null;
            while (promptResultNum < 1 || promptResultNum > points.length) {
                promptResultNum = await getPromptResult<number>({
                    type: "number",
                    message: `Please select destination point number between 1 and ${points.length}: `
                });
            }

            let destinationPoint: Point = points[promptResultNum - 1];
            console.log(`${destinationPoint.name} was selected as destination point...`)
            return [destinationPoint];
        }

        // handle all origin points
        if (promptResultStr === "all") {
            console.log(`All points were selected as destination points...`)
            return points;
        }

        return null;
    }

    async start() {
        // get input file from user
        let inputFile: string = await getPromptResult<string>({
            type: "text",
            message: "Please enter input file name: "
        });

        // read input file
        let points: Point[] = [];
        points = await this.inputFileHandler(inputFile);
        if (points === null) {
            exit();
            return;
        }

        // get origin points
        let originPoints = await this.originPointHandler(points);
        if (originPoints === null) {
            this.errorLog("Origin point/points couldn't get successfully!");
            exit();
            return;
        }

        // get destination points
        let destionationPoints = await this.destinationPointHandler(points);
        if (destionationPoints === null) {
            this.errorLog("Destination point/points couldn't get successfully!");
            exit();
            return;
        }

        // calculate distance
        let distanceService: DistanceService = new DistanceService();
        try {
            let distanceList: DistanceData[] = await distanceService.calculate(originPoints, destionationPoints);
            this.printDistanceData(distanceList);
        } catch (error) {
            this.errorLog("Calculate distance error => " + error);
            exit();
            return;
        }
    }
}