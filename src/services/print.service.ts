import fs from 'fs';
import { PrintData } from "../models/data.model";
const Excel = require('exceljs')

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
    _workbook: any;
    _worksheet: any

    constructor(name: string) {
        this._dir = "output/"
        this._name = name + ".xlsx";
        this._workbook = new Excel.Workbook();
        this._worksheet = this._workbook.addWorksheet('Sheet1');

        this._worksheet.columns = [
            { header: 'Origin Code', key: 'originCode' },
            { header: 'Origin Name', key: 'originName' },
            { header: 'Destination Code', key: 'destinationCode' },
            { header: 'Destination Name', key: 'destinationName' },
            { header: 'Distance', key: 'distance' },
            { header: 'Distance Measure', key: 'distanceMeasure' },
            { header: 'Duration', key: 'duration' },
            { header: 'Duration Measure', key: 'durationMeasure' },
        ];
        this._worksheet.columns.forEach(column => {
            column.width = column.header.length < 12 ? 12 : column.header.length
        })
        this._worksheet.getRow(1).font = { bold: true }

        fs.mkdirSync(this._dir, { recursive: true });
        this._workbook.xlsx.writeFile(this._dir + this._name);
    }

    printDistanceData(data: PrintData): void {
        this._worksheet.addRow({
            originCode: data.originPoint.code,
            originName: data.originPoint.name,
            destinationCode: data.destinationPoint.code,
            destinationName: data.destinationPoint.name,
            distance: Number(data.distance.value),
            distanceMeasure: data.distance.measure,
            duration: Number(data.duration.value),
            durationMeasure: data.duration.measure
        });
        this._workbook.xlsx.writeFile(this._dir + this._name);
    }
}