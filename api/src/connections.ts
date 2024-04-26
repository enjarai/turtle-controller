import type {Turtle} from "@shared/types";
import {WebSocket} from "ws";

const connections: Record<string, WebSocket> = {};

export function getConnection(turtle: Turtle): WebSocket | undefined {
    return connections[turtle.label];
}

export function deleteConnection(turtle: Turtle) {
    delete connections[turtle.label];
}

export function createConnection(turtle: Turtle, connection: WebSocket) {
    connections[turtle.label] = connection;
}