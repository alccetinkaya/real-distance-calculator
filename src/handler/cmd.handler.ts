import { DistanceData } from "../models/data.model";
import { Point } from "../models/point.model";
import { CmdInputFileTypes } from "../services/config.service";
import { DistanceService } from "../services/distance.service";
import { ExcelService } from "../services/excel.service";
import { LogServiceInterface } from "../services/log.service";
import { PointService } from "../services/point.service";
import { ConsolePrintService, ExcelPrintService, PrintServiceInterface } from "../services/print.service";
import { exit, getPromptResult } from "../utilities";

let promptResultStr: string;
let promptResultNum: number;

export class CmdHandler {
    _inputFileType: string = null;
    _logServices: LogServiceInterface[] = [];
    _printServices: PrintServiceInterface[] = []

    constructor(inputFileType: string, logServices: LogServiceInterface[]) {
        this._inputFileType = inputFileType;
        this._logServices = logServices;
    }

    errorLog(error: string) {
        for (const logService of this._logServices) {
            logService.errorLog(error);
        }
    }

    infoLog(info: string) {
        for (const logService of this._logServices) {
            logService.infoLog(info);
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
            this.infoLog(`${originPoint.name} has selected as origin point...`);
            return [originPoint];
        }

        // handle all origin points
        if (promptResultStr === "all") {
            this.infoLog(`All points were selected as origin points...`);
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
            this.infoLog(`${destinationPoint.name} has selected as destination point...`);
            return [destinationPoint];
        }

        // handle all origin points
        if (promptResultStr === "all") {
            this.infoLog(`All points were selected as destination points...`);
            return points;
        }

        return null;
    }

    async start() {
        let inputFile: string;
        let outputFile: string;

        // get output file name from user
        outputFile = ''
        while (outputFile === '') {
            outputFile = await getPromptResult<string>({
                type: "text",
                message: "Please enter output file name: "
            });
        }

        // get input file from user
        inputFile = await getPromptResult<string>({
            type: "text",
            message: "Please enter input file name for origins: "
        });
        // read origin input file
        let points: Point[] = [];
        points = await this.inputFileHandler(inputFile);
        if (points === null) {
            exit();
            return;
        }
        // get origin points
        let originPoints = await this.originPointHandler(points);
        if (originPoints === null) {
            this.errorLog("Origin point/points couldn't be imported successfully!");
            exit();
            return;
        }
        if (originPoints.length === 0) {
            this.errorLog("At least one origin point couldn't be imported");
            exit();
            return;
        }
        this.infoLog(originPoints.length + " origin point/points have imported")

        // get input file from user
        promptResultStr = await getPromptResult<string>({
            type: "text",
            message: "Do you want to use same origin file for destinations? (Y/n): "
        });
        if (promptResultStr !== "Y") {
            inputFile = await getPromptResult<string>({
                type: "text",
                message: "Please enter input file name for destinations: "
            });
        } else {
            this.infoLog("The origin file will be used as destination file");
        }
        // get destination points
        let destionationPoints = await this.destinationPointHandler(points);
        if (destionationPoints === null) {
            this.errorLog("Destination point/points couldn't be imported successfully!");
            exit();
            return;
        }
        if (destionationPoints.length === 0) {
            this.errorLog("At least one destination point couldn't be imported");
            exit();
            return;
        }
        this.infoLog(destionationPoints.length + " destination point/points have imported")

        // calculate distance
        await new DistanceService([new ConsolePrintService(), new ExcelPrintService(outputFile)]).calculate(originPoints, destionationPoints);
    }
}