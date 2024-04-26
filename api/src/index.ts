import 'dotenv/config';
import {saveTurtles} from "./turtles";
import {saveBlocks} from "./blocks";
import './socket';

setInterval(async () => {
    await saveTurtles();
    await saveBlocks();
}, 60 * 1000);

console.log("Initialized");
