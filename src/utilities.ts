const prompts = require('prompts');
import moment from 'moment';

export function exit() {
    console.log('\nPress any key to exit..');
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}

export async function getPromptResult<T>({ type = null, name = "default", message = null }): Promise<T> {
    let response = await prompts({
        type: type,
        name: name,
        message: message
    });
    return response[name];
}

export function getMaxLenOfListElement(list: any[]) {
    let size: number = 0;
    list.forEach(element => {
        let str: string;
        if (typeof element === 'object') {
            str = JSON.stringify(element);
        } else {
            str = element.toString();
        }
        size = size < str.length ? str.length : size;
    });
    return size;
}

export function getDateAsStr(timestampAsMs:number, format: string): string {
    return moment(timestampAsMs).format(format);
}

export function getDateAsNum(timestampAsMs:number, format: string): number {
    return Number(moment(timestampAsMs).format(format));
}

export function getCurrentDateAsStr(format: string): string {
    return moment().format(format);
}

export function getCurrentDateAsNum(format: string): number {
    return Number(moment().format(format));
}

export function getEpochTimeAsMs(date: string, format: string): number {
    return moment(date, format).valueOf();
}

export function getEpochTimeAsSec(date: string, format: string): number {
    return Math.round(getEpochTimeAsMs(date, format) / 1000);
}

export function getCurrentEpochTimeAsMs(): number {
    return moment().valueOf();
}

export function getCurrentEpochTimeAsSec(): number {
    return Math.round(getCurrentEpochTimeAsMs() / 1000);
}

export function getUtcOffset(): string {
    return new Date().toTimeString().split(" ")[1].slice(0,6);
}