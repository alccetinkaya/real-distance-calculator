import { Point } from "../models/point.model";
import { UserInputData, UserInputNames } from "../models/user-input.model";
import { CmdInputFileTypes, ConfigService } from "../services/config.service";
import { DistanceService } from "../services/distance.service";
import { ExcelService } from "../services/excel.service";
import { ConsoleLogService, FileLogService, LogServiceInterface } from "../services/log.service";
import { PointService } from "../services/point.service";
import { ConsolePrintService, ExcelPrintService, PrintServiceInterface } from "../services/print.service";
import { exit, getMaxLenOfListElement, getPromptResult } from "../utilities";

const configService = ConfigService.Instance;

let promptResultStr: string;
let promptResultNum: number;
let userInput: UserInputData = {
    originFileName: null,
    originPointSelect: null,
    originPointLen: 0,
    destinationFileName: null,
    destinationPointSelect: null,
    destinationPointLen: 0,
    outputFileName: null
};

export class CmdHandler {
    _logServices: LogServiceInterface[] = [];
    _printServices: PrintServiceInterface[] = []

    constructor(logServices: LogServiceInterface[]) {
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

    tableLog(session: any) {
        for (const logService of this._logServices) {
            logService.tableLog(session);
        }
    }

    printPointsToUser(points: Point[]) {
        points.forEach((point, i) => {
            console.log(`${(i + 1).toString().padEnd(3)} : ${point.name.toString().padEnd(getMaxLenOfListElement(points.map(obj => obj.name)))}`);
        });
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
        if (points.length < 1) {
            this.errorLog(`${excelFile} file doesn't have at least 1 row`);
            return null;
        }

        return new PointService(this._logServices).loadPoints(points);
    }

    async inputJsonFileHandler(jsonFile: string): Promise<Point[]> {
        let points: Point[];
        return points;
    }

    async inputFileHandler(inputFile: string): Promise<Point[]> {
        switch (configService.getCmdInputFileType()) {
            case CmdInputFileTypes.XLSX:
                return await this.inputExcelFileHandler(inputFile);
            case CmdInputFileTypes.JSON:
                return await this.inputJsonFileHandler(inputFile);
            default:
                return null;
        }
    }

    async originPointHandler(points: Point[]): Promise<Point[]> {
        promptResultStr = '';
        while (promptResultStr !== UserInputNames.ONE && promptResultStr !== UserInputNames.ALL) {
            promptResultStr = await getPromptResult<string>({
                type: "text",
                message: `Do you want to calculate distance for all origin points or one specific origin point? (${UserInputNames.ALL}/${UserInputNames.ONE}): `
            });
        }

        // handle one origin point
        if (promptResultStr === UserInputNames.ONE) {
            // print point list to user
            this.printPointsToUser(points);
            promptResultNum = null;
            while (promptResultNum < 1 || promptResultNum > points.length) {
                promptResultNum = await getPromptResult<number>({
                    type: "number",
                    message: `Please select origin point number between 1 and ${points.length}: `
                });
            }

            userInput.originPointSelect = UserInputNames.ONE;
            let originPoint: Point = points[promptResultNum - 1];
            this.infoLog(`${originPoint.name} has selected as origin point...`);
            return [originPoint];
        }

        // handle all origin points
        if (promptResultStr === UserInputNames.ALL) {
            userInput.originPointSelect = UserInputNames.ALL;
            this.infoLog(`All points were selected as origin points...`);
            return points;
        }

        return null;
    }

    async destinationPointHandler(points: Point[]): Promise<Point[]> {
        promptResultStr = '';
        while (promptResultStr !== UserInputNames.ONE && promptResultStr !== UserInputNames.ALL) {
            promptResultStr = await getPromptResult<string>({
                type: "text",
                message: `Do you want to calculate distance for all destination points or one specific destination point? (${UserInputNames.ALL}/${UserInputNames.ONE}): `
            });
        }

        // handle one destination point
        if (promptResultStr === UserInputNames.ONE) {
            // print point list to user
            this.printPointsToUser(points);
            promptResultNum = null;
            while (promptResultNum < 1 || promptResultNum > points.length) {
                promptResultNum = await getPromptResult<number>({
                    type: "number",
                    message: `Please select destination point number between 1 and ${points.length}: `
                });
            }

            userInput.destinationPointSelect = UserInputNames.ONE;
            let destinationPoint: Point = points[promptResultNum - 1];
            this.infoLog(`${destinationPoint.name} has selected as destination point...`);
            return [destinationPoint];
        }

        // handle all origin points
        if (promptResultStr === UserInputNames.ALL) {
            userInput.destinationPointSelect = UserInputNames.ALL;
            this.infoLog(`All points were selected as destination points...`);
            return points;
        }

        return null;
    }

    async start() {
        let inputFile: string;
        let outputFile: string;
        let points: Point[] = [];

        // get input file from user
        inputFile = await getPromptResult<string>({
            type: "text",
            message: "Please enter input file name for origins: "
        });
        // read origin input file
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
        userInput.originFileName = inputFile;
        userInput.originPointLen = originPoints.length;

        // get input file from user
        promptResultStr = await getPromptResult<string>({
            type: "text",
            message: `Do you want to use same origin file for destinations? (${UserInputNames.YES}/${UserInputNames.NO}): `
        });
        if (promptResultStr !== UserInputNames.YES) {
            inputFile = await getPromptResult<string>({
                type: "text",
                message: "Please enter input file name for destinations: "
            });
            // read destination input file
            points = await this.inputFileHandler(inputFile);
            if (points === null) {
                exit();
                return;
            }
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
        this.infoLog(destionationPoints.length + " destination point/points have imported");
        userInput.destinationFileName = inputFile;
        userInput.destinationPointLen = destionationPoints.length;

        // get output file name from user
        outputFile = ''
        while (outputFile === '') {
            outputFile = await getPromptResult<string>({
                type: "text",
                message: "Please enter output file name: "
            });
        }
        userInput.outputFileName = outputFile;


        this.tableLog({
            "Config Mode": configService.getConfigMode(),
            "Config API Name": configService.getConfigApiName(),
            "Config Direction": configService.getConfigDirection(),
            "Origin Point File Name": userInput.originFileName,
            "Origin Point Selection": userInput.originPointSelect,
            "Origin Point Length": userInput.originPointLen,
            "Destination Point File Name": userInput.destinationFileName,
            "Destination Point Selection": userInput.destinationPointSelect,
            "Destination Point Length": userInput.destinationPointLen,
            "Output File Name": userInput.outputFileName

        });

        /*this.sessionLog("Config parameters => Mode: " + configService.getConfigMode() +
            " | ApiName: " + configService.getConfigApiName() +
            " | Direction: " + configService.getConfigDirection());
        this.sessionLog("User inputs => Origin File Name: " + userInput.originFileName +
            " | Origin Point: " + userInput.originPoint + " | Origin Point Length: " + userInput.originPointLen +
            " | Destination File Name: " + userInput.destinationFileName +
            " | Destionation Point: " + userInput.destinationPoint + " | Destionation Point Length: " + userInput.destinationPointLen +
            " | Output File Name: " + userInput.outputFileName);*/


        promptResultStr = '';
        while (promptResultStr !== UserInputNames.YES && promptResultStr !== UserInputNames.NO) {
            promptResultStr = await getPromptResult<string>({
                type: "text",
                message: `Do you confirm above configuration parameters and inputs? (${UserInputNames.YES}/${UserInputNames.NO}): `
            });
        }

        // calculate distance
        if (promptResultStr === UserInputNames.YES) {
            await new DistanceService([new ConsoleLogService(), FileLogService.Instance],
                [new ConsolePrintService(), new ExcelPrintService(outputFile)])
                .calculate(userInput, originPoints, destionationPoints);
        }
    }
}