import 'dotenv/config';
import {saveTurtles} from "./turtles";
import {saveBlocks} from "./blocks";
import './socket';
import {tick} from "./orders";

setInterval(async () => {
    await saveTurtles();
    await saveBlocks();
}, 60 * 1000);

setInterval(tick, 1000);

async function exitHandler(evtOrExitCodeOrError: number | string | Error) {
    try {
        await saveTurtles();
        await saveBlocks();
    } catch (e) {
        console.error('EXIT HANDLER ERROR', e);
    }

    process.exit(isNaN(+evtOrExitCodeOrError) ? 1 : +evtOrExitCodeOrError);
}

[
    'beforeExit', 'uncaughtException', 'unhandledRejection',
    'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP',
    'SIGABRT','SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV',
    'SIGUSR2', 'SIGTERM',
].forEach(evt => process.on(evt, exitHandler));

console.log("Initialized");
