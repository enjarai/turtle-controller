import {WebSocket} from "ws";
import {addTurtle, getTurtle, refreshInventory, syncTurtles} from "./turtles";
import {WebSocketServer} from "ws";
import {createConnection, deleteConnection, getConnection} from "./connections";
import {websocketPort} from "./misc";

const wss = new WebSocketServer({port: websocketPort});

wss.on('connection', (ws: WebSocket) => {
    let label: string | null = null;

    // Handle keep-alive ping and timeout
    const interval = setInterval(() => {
        ws.send("p:" + "k-a");
        const timeout = setTimeout(() => {
            console.log(`turtle ${label} timed out on keep-alive ping`);
            ws.close();
        }, 5000);
        ws.once('message', data => {
            clearTimeout(timeout);
        })
    }, 5000);
    ws.on('close', async () => {
        clearInterval(interval);
        const turtle = getTurtle(label);
        if (turtle) {
            deleteConnection(turtle);
            turtle.lock = undefined;
            await syncTurtles(turtle);
        }
    });


    ws.on('error', console.error);

    ws.on('message', async data => {
        console.log('received: %s', data);

        const query = data.toString('utf-8');
        const type = query.slice(0, 1);
        const value = query.slice(2, query.length);

        if (type === "c") {
            let turtle = getTurtle(label);
            if (turtle && getConnection(turtle)) {
                console.log(`Turtle ${value} reconnected`)
            } else {
                console.log(`Turtle ${value} connected`)
            }
            if (!turtle) {
                turtle = {
                    label: value,
                    position: [0, 0, 0],
                    facing: "north",
                    inventory: [
                        null, null, null, null,
                        null, null, null, null,
                        null, null, null, null,
                        null, null, null, null,
                    ],
                    selectedSlot: 0,
                }
            }
            createConnection(turtle, ws);
            label = value;
            await refreshInventory(turtle);
            addTurtle(turtle)
            await syncTurtles(turtle);
        } else if (type === "p") { // p = ping
            ws.send("q:" + value); // q = ping reply
        }
    });
});

console.log("Listening for turtle connections...");
