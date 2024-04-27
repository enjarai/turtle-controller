import type {Turtle} from "@shared/types";
import {WebSocket} from "ws";
import {syncTurtles} from "./turtles";

const connections: Record<string, WebSocket> = {};

export function getConnection(turtle: Turtle): WebSocket | undefined {
    return connections[turtle.label];
}

export function deleteConnection(turtle: Turtle) {
    delete connections[turtle.label];
    delete turtle.connected;
}

export function createConnection(turtle: Turtle, connection: WebSocket) {
    turtle.connected = true;
    connections[turtle.label] = connection;
}