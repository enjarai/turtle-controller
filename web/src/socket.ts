import {writable} from "svelte/store";
import {turtles} from "./turtles";
import type {Turtle, WorldBlock} from "@shared/types";
import {blocks} from "./blocks";

export const wsc = new WebSocket("ws://localhost:4040");
export let loggedIn = writable(false);

wsc.onmessage = async (event) => {
    const query: string = event.data;
    const type = query.slice(0, 1);
    const value = query.slice(2, query.length);

    if (type === "c") {
        if (value === "true") {
            loggedIn.set(true);
            // Request all turtles and blocks from the server.
            wsc.send("T:");
            wsc.send("B:");
        }
    } else if (type === "T") {
        turtles.set(JSON.parse(value));
    } else if (type === "t") {
        JSON.parse(value).forEach((t: Turtle) => turtles.updateTurtle(t.label, () => t))
    } else if (type === "B") {
        blocks.set(JSON.parse(value));
    } else if (type === "b") {
        JSON.parse(value).forEach((b: WorldBlock) => blocks.setBlock(b.position, b));
    } else if (type === "r") {
        const response = JSON.parse(value);
        const queryIndex = ongoingQueries.findIndex(q => q.syncId === response.syncId);
        if (queryIndex !== -1) {
            ongoingQueries[queryIndex].resolve(response.payload);
            ongoingQueries.splice(queryIndex, 1);
        } else {
            console.warn(`Got response to unsent query '${JSON.stringify(response)}'`)
        }
    } else {
        console.warn(`Unexpected server response '${query}'`);
    }
};

let currentSyncId = 0;
const ongoingQueries: Query<any>[] = [];

type Query<T> = {syncId: number, resolve: (value: T) => void};

export function getSyncId(): number {
    return currentSyncId++;
}

export async function expectResponse<T>(channel: string, payload: any): Promise<T> {
    return new Promise((resolve, reject) => {
        const syncId = getSyncId()
        ongoingQueries.push({
            syncId,
            resolve
        })
        wsc.send(channel + ":" + JSON.stringify({
            syncId,
            payload
        }));
    });
}