import { DistanceData, PrintData } from "../models/data.model";
const Excel = require('exceljs')

export interface PrintServiceInterface {
    printDistanceData(data: PrintData): void
}

export class ConsolePrintService implements PrintServiceInterface {
    printDistanceData(data: PrintData): void {
        console.log(`${data.originPoint.name.padEnd(25)} -> ${data.destinationPoint.name.padEnd(25)} || Distance: ${data.distance.value.padEnd(15)} Duration: ${data.duration.value}`);
    }
}

export class ExcelPrintService implements PrintServiceInterface {
    _name: string;
    _workbook: any;
    _worksheet: any

    constructor(name: string) {
        this._name = name + ".xlsx";
        this._workbook = new Excel.Workbook();
        this._worksheet = this._workbook.addWorksheet('Sheet 1');

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
    }

    printDistanceData(data: PrintData): void {
        this._worksheet.addRow({
            originCode: data.originPoint.code,
            originName: data.originPoint.name,
            destinationCode: data.destinationPoint.code,
            destinationName: data.destinationPoint.name,
            distance: data.distance.value,
            distanceMeasure: data.distance.measure,
            duration: data.duration.value,
            durationMeasure: data.duration.measure
        });
        this._workbook.xlsx.writeFile(this._name);
    }
}