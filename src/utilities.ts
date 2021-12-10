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