import { DistanceData } from "../models/data.model"
import { getDate_YYYYMMDD, getDate_YYYYMMDD_HHMMSS } from "../utilities";
import fs from 'fs';

export interface LogServiceInterface {
    errorLog(error: string): void;
    warnLog(warning: string):void;
    infoLog(info: string): void;
}

export class ConsoleLogService implements LogServiceInterface {
    errorLog(error: string): void {
        console.log("\x1b[31mERROR: " + error + "\x1b[0m");
    }

    warnLog(warning: string):void  {
        console.log("\x1b[35mWARN: " + warning + "\x1b[0m");
    }

    infoLog(info: string): void {
        console.log("\x1b[33mINFO: " + info + "\x1b[0m");
    }
}

export class FileLogService implements LogServiceInterface {
    static _instance: FileLogService;
    _dir: string;
    _name: string;
    _file: any;

    private constructor() {
        this._dir = "log/";
        this._name = getDate_YYYYMMDD(Date.now()) + ".log";
        this.createFileSync();
    }

    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    errorLog(error: string): void {
        this.write(`[${getDate_YYYYMMDD_HHMMSS(Date.now())}][ERR] ${error}`);
    }

    warnLog(warning: string): void {
        this.write(`[${getDate_YYYYMMDD_HHMMSS(Date.now())}][WRN] ${warning}`);
    }

    infoLog(info: string): void {
        this.write(`[${getDate_YYYYMMDD_HHMMSS(Date.now())}][INF] ${info}`);
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