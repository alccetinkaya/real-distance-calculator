const Excel = require('read-excel-file/node');
//const Excel = require('exceljs')

export class ExcelService {
    readExcelFile(filePath: string) {
        Excel(filePath).then((rows: any) => {
            return rows;
        });
    }

    readExcelFileSync(filePath: string): Promise<any[]> {
        return new Promise((resolve, _reject) => {
            Excel(filePath).then((rows: any[]) => {
                resolve(rows);
            });
        });
    }

    async readPointsFromExcelFileSync(filePath: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            Excel(filePath)
                .then((rows: any[]) => {
                    rows.shift(); // discard the first line
                    resolve(rows);
                })
                .catch((error: any) => reject(error));
        });
    }
}