import {type WebSocket, WebSocketServer} from "ws";
import {clientPort, password} from "./misc";
import {getTurtle, sendCommand, turtles} from "./turtles";
import {blocks, getBlock} from "./blocks";
import type {Vec3} from "@shared/types";

export const connectedClients: WebSocket[] = [];

const wss = new WebSocketServer({port: clientPort});

wss.on('connection', (ws: WebSocket) => {
    let authed = false;

    ws.on('close', async () => {
        const i = connectedClients.indexOf(ws);
        if (i !== -1) {
            connectedClients.splice(i, 1);
        }
    });

    ws.on('error', console.error);

    ws.on('message', async data => {
        console.log('received (c): %s', data);

        const query = data.toString('utf-8');
        const type = query.slice(0, 1);
        const value = query.slice(2, query.length);

        if (type === "c") {
            if (value === password) {
                connectedClients.push(ws);
                authed = true;
                ws.send("c:true");
            }
            ws.send("c:false");
        } else if (type === "p") { // p = ping
            ws.send("q:" + value); // q = ping reply
        } else if (type === "T") { // "T:"
            ws.send("T:" + JSON.stringify(turtles));
        } else if (type === "t") { // "t:["label1","label2"]"
            ws.send("t:" + JSON.stringify(JSON.parse(value).map((s: string) => getTurtle(s))));
        } else if (type === "B") { // "B:"
            ws.send("B:" + JSON.stringify(blocks));
        } else if (type === "b") { // "b:[[1, 2, 3], [4, 5, 6]]"
            ws.send("b:" + JSON.stringify(JSON.parse(value).map((s: Vec3) => getBlock(s))));
        } else if (type === "e") {
            await respondSynced(ws, value, async (payload: {turtle: string, command: string}) => {
                const turtle = getTurtle(payload.turtle);
                if (turtle) {
                    return await sendCommand(turtle, payload.command);
                } else {
                    return null;
                }
            });
        }
    });
});

export function sendToAll(payload: string) {
    connectedClients.forEach(ws => ws.send(payload));
}

async function respondSynced<T>(ws: WebSocket, value: string, action: (payload: T) => Promise<any>) {
    const query = JSON.parse(value);
    const payload = await action(query.payload);
    ws.send("r:" + JSON.stringify({
        syncId: query.syncId,
        payload,
    }));
}

console.log("Listening for client connections...");



