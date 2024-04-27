import {type WebSocket, WebSocketServer} from "ws";
import {clientPort, password} from "./misc";
import {
    getTurtle, interactionActions,
    moveActions,
    refreshInventory, refuel,
    scanAll,
    selectSlot,
    sendCommand, syncTurtles,
    transferTo,
    turtles
} from "./turtles";
import {blocks, getBlock} from "./blocks";
import type {InteractionDirection, Vec3} from "@shared/types";
import type {Order} from "@shared/orders";

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
        } else if (type === "m") {
            await respondSynced(ws, value, async (payload: {turtle: string, command: string}) => {
                const turtle = getTurtle(payload.turtle);
                if (turtle) {
                    return await moveActions[payload.command](turtle);
                } else {
                    return null;
                }
            });
        } else if (type === "s") {
            await respondSynced(ws, value, async (label: string) => {
                const turtle = getTurtle(label);
                if (turtle) {
                    await scanAll(turtle);
                    return true;
                } else {
                    return false;
                }
            });
        } else if (type === "i") {
            await respondSynced(ws, value, async (label: string) => {
                const turtle = getTurtle(label);
                if (turtle) {
                    return await refreshInventory(turtle);
                } else {
                    return false;
                }
            });
        } else if (type === "o") {
            await respondSynced(ws, value, async (payload: {turtle: string, slot: number}) => {
                const turtle = getTurtle(payload.turtle);
                if (turtle) {
                    return await selectSlot(turtle, payload.slot);
                } else {
                    return false;
                }
            });
        } else if (type === "f") {
            await respondSynced(ws, value, async (payload: {turtle: string, destinationSlot: number, maxCount: number | null}) => {
                const turtle = getTurtle(payload.turtle);
                if (turtle) {
                    return await transferTo(turtle, payload.destinationSlot, payload.maxCount || undefined);
                } else {
                    return false;
                }
            });
        } else if (type === "n") {
            await respondSynced(ws, value, async (payload: {turtle: string, command: string, direction: InteractionDirection}) => {
                const turtle = getTurtle(payload.turtle);
                if (turtle) {
                    return await interactionActions[payload.command](turtle, payload.direction);
                } else {
                    return false;
                }
            });
        } else if (type === "u") {
            await respondSynced(ws, value, async (label: string) => {
                const turtle = getTurtle(label);
                if (turtle) {
                    return await refuel(turtle);
                } else {
                    return false;
                }
            });
        } else if (type === "O") {
            await respondSynced(ws, value, async (payload: {turtle: string, order: Order}) => {
                const turtle = getTurtle(payload.turtle);
                if (turtle) {
                    turtle.orders.push(payload.order);
                    await syncTurtles(turtle);
                    return true;
                } else {
                    return false;
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
    try {
        const payload = await action(query.payload);
        console.log(`Responding to syncId ${query.syncId} with ${JSON.stringify(payload)}`)
        ws.send("r:" + JSON.stringify({
            syncId: query.syncId,
            payload,
        }));
    } catch (e) {
        console.log(`Responding to syncId ${query.syncId} with failure`)
        ws.send("r:" + JSON.stringify({
            syncId: query.syncId,
            error: e,
        }));
    }
}

console.log("Listening for client connections...");



