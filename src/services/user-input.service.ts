import { UserInputData } from "../models/data.model";
import { getCurrentDateAsNum, getCurrentDateAsStr, getEpochTimeAsSec } from "../utilities";
import { LogServiceInterface } from "./log.service";

export enum UserInputNames {
    EMPTY = "",
    YES = "Y",
    NO = "n",
    ONE = "one",
    ALL = "all"
};

export class UserInputService {
    _logServices: LogServiceInterface[];
    _data: UserInputData = {
        originFileName: null,
        originPointSelect: UserInputNames.EMPTY,
        originPointLen: 0,
        destinationFileName: null,
        destinationPointSelect: UserInputNames.EMPTY,
        destinationPointLen: 0,
        departureTime_DD_MM_YYYY: null,
        departureTime_HH_MM: null,
        departureEpochTime: 0,
        outputFileName: null
    };

    constructor(logServices: LogServiceInterface[]) {
        this._logServices = logServices;
    }

    setOriginFileName(name: string) {
        this._data.originFileName = name;
    }

    getOriginFileName(): string {
        return this._data.originFileName;
    }

    setOriginPointSelect(select: UserInputNames) {
        this._data.originPointSelect = select;
    }

    getOriginPointSelect(): UserInputNames {
        return this._data.originPointSelect;
    }

    setOriginPointLen(len: number) {
        this._data.originPointLen = len;
    }

    getOriginPointLen(): number {
        return this._data.originPointLen;
    }

    setDestinationFileName(name: string) {
        this._data.destinationFileName = name;
    }

    getDestinationFileName(): string {
        return this._data.destinationFileName;
    }

    setDestinationPointSelect(select: UserInputNames) {
        this._data.destinationPointSelect = select;
    }

    getDestinationPointSelect(): UserInputNames {
        return this._data.destinationPointSelect;
    }

    setDestinationPointLen(len: number) {
        this._data.destinationPointLen = len;
    }

    getDestinationPointLen(): number {
        return this._data.destinationPointLen;
    }

    checkDeparture_DD_MM_YYYY(date: string): boolean {
        const splitChar = "-";
        let strList: string[] = date.split(splitChar);
        if (strList.length > 3) return false;

        let [yearStr, monthStr, dayStr] = [...strList];
        if (yearStr === null || yearStr === undefined || monthStr === null || monthStr === undefined || dayStr === null || dayStr === undefined) return false;

        let [dayNum, monthNum, yearNum] = [...strList.map(Number)];
        if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return false;

        let currYear: number = getCurrentDateAsNum("YYYY");
        if (yearNum < currYear) return false;

        let currMonth: number = getCurrentDateAsNum("MM");
        if (monthNum < 0 || monthNum > 12 || monthNum > currMonth) return false;

        let currDay: number = getCurrentDateAsNum("DD");
        if (dayNum < 0 || dayNum > 31 || dayNum < currDay) return false;

        this._data.departureTime_DD_MM_YYYY = ('0' + dayNum).slice(-2) + splitChar + ('0' + monthNum).slice(-2) + splitChar + yearNum;
        return true;
    }

    checkDeparture_HH_MM(time: string): boolean {
        const splitChar = ":";
        let strList: string[] = time.split(splitChar);
        if (strList.length > 2) return false;

        let [hourStr, minStr] = [...strList];
        if (hourStr === null || hourStr === undefined || minStr === null || minStr === undefined) return false;

        let [hourNum, minNum] = [...strList.map(Number)];
        if (isNaN(hourNum) || isNaN(minNum)) return false;
        if (hourNum < 0 || hourNum > 23) return false;
        if (minNum < 0 || minNum > 59) return false;

        if (this.getDepartureTime_DD_MM_YYYY() === getCurrentDateAsStr("DD-MM-YYYY")) {
            let currHour: number = getCurrentDateAsNum("hh");
            let currMin: number = getCurrentDateAsNum("mm");

            if (hourNum < currHour) return false;
            if (hourNum == currHour) {
                if (minNum <= currMin) return false;
            }
        }

        this._data.departureTime_HH_MM = ('0' + hourNum).slice(-2) + splitChar + ('0' + minNum).slice(-2);
        return true;
    }

    setDepartureTime_DD_MM_YYYY(time: string) {
        return this.checkDeparture_DD_MM_YYYY(time);
    }

    getDepartureTime_DD_MM_YYYY(): string {
        return this._data.departureTime_DD_MM_YYYY;
    }

    setDepartureTime_HH_MM(time: string) {
        return this.checkDeparture_HH_MM(time);
    }

    getDepartureTime_HH_MM(): string {
        return this._data.departureTime_HH_MM;
    }

    setDepartureEpochTimeAsSec() {
        this._data.departureEpochTime = getEpochTimeAsSec(this.getDepartureTime_DD_MM_YYYY() + " " + this.getDepartureTime_HH_MM(), "DD-MM-YYYY hh:mm");
    }

    getDepartureEpochTimeAsSec(): number {
        return this._data.departureEpochTime;
    }

    setOutputFileName(name: string) {
        this._data.outputFileName = name;
    }

    getOutputFileName(): string {
        return this._data.outputFileName;
    }
}