import * as fs from "fs";

export const dataDirectory = process.env.DATA_DIRECTORY || "data";
export const websocketPort: number = parseInt(process.env.WEBSOCKET_PORT || "4042");
export const clientPort: number = parseInt(process.env.CLIENT_PORT || "4040");
export const password: string = process.env.PASSWORD || "balls";

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
}
