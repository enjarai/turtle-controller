import * as fs from "fs";

export const dataDirectory = process.env.DATA_DIRECTORY || "data";
export const websocketPort: number = parseInt(process.env.WEBSOCKET_PORT || "4042");
export const clientPort: number = parseInt(process.env.WEBSOCKET_PORT || "4040");
export const password: string = process.env.PASSWORD || "balls";

if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
}

export function hashCode(str: string) {
    let hash = 0,
        i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}