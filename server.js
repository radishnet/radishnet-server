import { WebSocket, WebSocketServer } from "ws"
import { nanoid } from "nanoid"
import { parse } from "url"
import { log } from "./utils.js"

const SERVER_PORT = 3000
const SEND_WORLD_STATE_HZ = 60

const server = new WebSocketServer({ port: SERVER_PORT })
let clients = []

server.on("listening", () => log(`Server is listening for connections...`))

server.on("connection", (socket, req) => {
    const parsedRequestUrl = parse(req.url, true, true)
    const clientType = parsedRequestUrl.query?.clientType
    socket.id = nanoid(6)
    addClient(clientType, socket)
    bindSocketEvents(socket)
    sendClientIdToClient(socket)
})

function addClient(clientType, socket) {
    const newClient = {
        clientType: clientType,
        socket: socket,
    }
    clients.push(newClient)
    log(`Added client ${socket.id} (${clientType}). Currently connected: ${currentlyConnectedClientsString()}`)
}

function bindSocketEvents(socket) {
    socket.on("message", (message) => processMessage(message, socket))
    socket.on("error", (error) => log(`Server received error from socket:` + error))
    socket.on("close", () => {
        log(`Socket ${socket.id} closed`)
        removeClient(socket)
    })
}

function processMessage(unparsedMessage, socket) {
    const message = JSON.parse(unparsedMessage.toString())
    switch (message.type) {
        case "PlayerStateMessage":
            const client = clients.find((_client) => _client.socket.id === socket.id)
            client.state = message.payload
            break
        default:
            console.warn(`Unknown message type: ${message.type}`)
            break
    }
}

function sendClientIdToClient(socket) {
    const clientIdMessage = {
        type: "ClientIdMessage",
        payload: socket.id,
    }
    socket.send(JSON.stringify(clientIdMessage))
}

function removeClient(socket) {
    const indexOfClientToRemove = clients.findIndex((client) => client.socket.id === socket.id)
    const removedClientId = clients[indexOfClientToRemove].socket.id
    const removedClientType = clients[indexOfClientToRemove].clientType
    clients.splice(indexOfClientToRemove, 1)
    log(`Removed client ${removedClientId} (${removedClientType}). Currently connected: ${currentlyConnectedClientsString()}`)
}

function currentlyConnectedClientsString() {
    return clients.map((client) => `${client.socket.id} (${client.clientType})`).join(", ")
}

server.on("error", (error) => log(`Server received error: ${error}`))

server.on("close", () => log(`Server closed connection`))

setInterval(sendWorldStateToClients, (1 / SEND_WORLD_STATE_HZ) * 1000)

function sendWorldStateToClients() {
    const worldState = getWorldState()
    const worldStateMessage = {
        type: "WorldStateMessage",
        payload: worldState,
    }
    server.clients.forEach((webSocketClient) => {
        if (webSocketClient.readyState !== WebSocket.OPEN) return
        webSocketClient.send(JSON.stringify(worldStateMessage))
    })
}

function getWorldState() {
    const worldInfo = {
        weather: "sunny",
    }
    const playerStates = clients
        .filter((client) => client.clientType === "vr")
        .map((client) => ({
            ...client.state,
            clientId: client.socket.id,
        }))
    const objectStates = []
    const worldState = {
        worldInfo: worldInfo,
        playerStates: playerStates,
        objectStates: objectStates,
    }
    return worldState
}
