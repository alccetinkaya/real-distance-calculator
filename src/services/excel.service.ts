const readExcelFile = require('read-excel-file/node');

export class ExcelService {
    readExcelFile(filePath: string) {
        readExcelFile(filePath).then((rows: any) => {
            return rows;
        });
    }

    readExcelFileSync(filePath: string): Promise<any[]> {
        return new Promise((resolve, _reject) => {
            readExcelFile(filePath).then((rows: any[]) => {
                resolve(rows);
            });
        });
    }

    async readPointsFromExcelFileSync(filePath: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            readExcelFile(filePath)
                .then((rows: any[]) => {
                    rows.shift(); // discard the first line
                    resolve(rows);
                })
                .catch((error: any) => reject(error));
        });
    }
}