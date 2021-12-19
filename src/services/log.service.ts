import { getCurrentDateAsStr, getMaxLenOfListElement } from "../utilities";
import fs from 'fs';
const colors = require('colors');

export interface LogServiceInterface {
    errorLog(error: string): void;
    warnLog(warning: string): void;
    infoLog(info: string): void;
    tableLog(data: any): void;
}

export class ConsoleLogService implements LogServiceInterface {
    consoleTable(data: any) {
        if (typeof data === 'object') {
            let newData: any = {};
            let keyList: string[] = Object.keys(data);
            let valueList: string[] = Object.values(data);

            let keyMaxLen = getMaxLenOfListElement(keyList);
            let valueMaxLen = getMaxLenOfListElement(valueList);

            for (let i = 0; i < keyList.length; i++) {
                newData[colors.cyan(keyList[i].toString().padEnd(keyMaxLen))] = valueList[i].toString().padEnd(valueMaxLen);
            }
            console.table(newData);
        } else {
            console.table(data);
        }
    }

    errorLog(error: string): void {
        console.log(colors.red("ERROR: " + error));
    }

    warnLog(warning: string): void {
        console.log(colors.yellow("WARNING:" + warning));
    }

    infoLog(info: string): void {
        console.log(colors.grey.bold("INFO: " + info));
    }

    tableLog(data: any) {
        this.consoleTable(data);
    }
}

export class FileLogService implements LogServiceInterface {
    static _instance: FileLogService;
    _dir: string;
    _name: string;
    _file: any;

    private constructor() {
        this._dir = "log/";
        this._name = getCurrentDateAsStr("YYYY-MM-DD") + ".log"
        this.createFileSync();
    }

    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    errorLog(error: string): void {
        this.write(`[${getCurrentDateAsStr("HH:MM:SS")}][ERR] ${error}`);
    }

    warnLog(warning: string): void {
        this.write(`[${getCurrentDateAsStr("HH:MM:SS")}][WRN] ${warning}`);
    }

    infoLog(info: string): void {
        this.write(`[${getCurrentDateAsStr("HH:MM:SS")}][INF] ${info}`);
    }

    tableLog(data: any) {
        this.write(`[${getCurrentDateAsStr("HH:MM:SS")}][TBL] ${JSON.stringify(data)}`);
    }

    async createFileSync() {
        fs.mkdirSync(this._dir, { recursive: true });
        this._file = fs.createWriteStream(this._dir + this._name, {
            flags: 'a'
        });
    }

    write(data: string) {
        this._file.write(data + "\n");
    }
}