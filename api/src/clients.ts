import {type WebSocket, WebSocketServer} from "ws";
import {clientPort, password} from "./misc";

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
        }
    });
});

console.log("Listening for client connections...");



