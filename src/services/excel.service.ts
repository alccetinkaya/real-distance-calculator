const Excel = require('exceljs')

export class ExcelService {
    _workbook: any;

    constructor() {
        this._workbook = this.createWorkbook();
    }

    createWorkbook() {
        return new Excel.Workbook();
    }

    addWorksheet(sheetName: string) {
        this._workbook.addWorksheet(sheetName);
    }

    getWorksheet(sheetName: string) {
        return this._workbook.getWorksheet(sheetName);
    }

    addRow(sheetName: string, data: any) {
        this.getWorksheet(sheetName).addRow(data);
    }

    getRow(sheetName: string, index: number) {
        return this.getWorksheet(sheetName).getRow(index);
    }

    async readFile(fileName: string, sheetName: string = "Sheet1", discardHeader: boolean = false): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this._workbook.xlsx.readFile(fileName)
                .then(() => {
                    let worksheet = this._workbook.getWorksheet(sheetName);
                    if (!worksheet) reject(`Worksheet ${sheetName} could not found`);

                    let rows: any[] = [];
                    worksheet.eachRow({}, (row: any, rowNumber: number) => {
                        if (discardHeader === true && rowNumber == 1) return;

                        let tempList: any[] = [];
                        row.values.forEach((element: any) => {
                            tempList.push(element);
                        });
                        rows.push(tempList);
                    });
                    resolve(rows);
                })
                .catch((error: any) => reject(error));
        });
    }

    async writeFile(fileName: string) {
        await this._workbook.xlsx.writeFile(fileName);
    }
}