import fs from 'fs';
import { PrintData } from "../models/data.model";
import { ExcelService } from './excel.service';

export interface PrintServiceInterface {
    printDistanceData(data: PrintData): void
}

export class ConsolePrintService implements PrintServiceInterface {
    printDistanceData(data: PrintData): void {
        let originPointName: string = data.originPoint.name.padEnd(25);
        let destinationPointName: string = data.destinationPoint.name.padEnd(25);
        let distance: string = (data.distance.value + " " + data.distance.measure).padEnd(10);
        let duration: string = (data.duration.value + " " + data.duration.measure);
        console.log(originPointName + " -> " + destinationPointName + " || " + "Distance: " + distance + " Duration: " + duration);
    }
}

export class ExcelPrintService implements PrintServiceInterface {
    _dir: string;
    _name: string;
    _sheetName: string;
    _excelService: ExcelService;

    constructor(name: string, excelService: ExcelService) {
        this._dir = "output/"
        this._name = name + ".xlsx";
        this._sheetName = "Sheet1";
        this._excelService = excelService;

        this._excelService.addWorksheet(this._sheetName);
        this._excelService.getWorksheet(this._sheetName).columns = [
            { header: 'Origin Code', key: 'originCode', width: 20 },
            { header: 'Origin Name', key: 'originName', width: 20 },
            { header: 'Destination Code', key: 'destinationCode', width: 20 },
            { header: 'Destination Name', key: 'destinationName', width: 20 },
            { header: 'Distance', key: 'distance', width: 20 },
            { header: 'Distance Measure', key: 'distanceMeasure', width: 20 },
            { header: 'Duration', key: 'duration', width: 20 },
            { header: 'Duration Measure', key: 'durationMeasure', width: 20 },
        ];
        this._excelService.getRow(this._sheetName, 1).font = { bold: true }

        fs.mkdirSync(this._dir, { recursive: true });
        this._excelService.writeFile(this._dir + this._name);
    }

    async printDistanceData(data: PrintData) {
        this._excelService.addRow(this._sheetName, {
            originCode: data.originPoint.code,
            originName: data.originPoint.name,
            destinationCode: data.destinationPoint.code,
            destinationName: data.destinationPoint.name,
            distance: Number(data.distance.value),
            distanceMeasure: data.distance.measure,
            duration: Number(data.duration.value),
            durationMeasure: data.duration.measure
        });
        await this._excelService.writeFile(this._dir + this._name);
    }
}