const prompts = require('prompts');

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

export function getDate_YYYYMMDD(timestamp: number): string {
    return new Date(timestamp).toJSON().slice(0, 10);
}

export function getDate_YYYYMMDD_HHMMSS(timestamp: number): string {
    return new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
}