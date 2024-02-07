import { WebSocketServer, WebSocket, Data } from "ws"
import express from "express"
import { nanoid } from "nanoid"
import GameSession from "./gameSession.js"
import { log } from "./utils.js"
import { WebSocketWithId, WorldInfo, WorldState, WorldStateMessage } from "./types.js"

const WEBSOCKET_SERVER_PORT = 3000
const API_SERVER_PORT = 3001
const SEND_WORLD_STATE_HZ = 1

const webSocketServer = new WebSocketServer({ port: WEBSOCKET_SERVER_PORT })
const apiServer = express()
const gameSession = new GameSession()

webSocketServer.on("listening", () => {
    log(`Websocket server is listening for connections...`)
})

webSocketServer.on("connection", (socket: WebSocketWithId) => {
    socket.id = nanoid(6)

    log(`New client connecting with socket id ${socket.id}`)
    gameSession.addPlayer(socket)

    socket.on("message", (message: Data) => {
        gameSession.processMessage(message, socket)
    })

    socket.on("error", (error: Error) => {
        log(`Server received error from socket:` + error)
    })

    socket.on("close", () => {
        gameSession.removePlayer(socket.id)
    })
})

const sendWorldStateInterval = setInterval(
    () => {
        sendWorldState()
    },
    (1 / SEND_WORLD_STATE_HZ) * 1000
)

function sendWorldState() {
    const playerStates = gameSession.players.map((player) => player.state)

    const worldInfo: WorldInfo = {
        weather: "sunny",
    }

    const worldState: WorldState = {
        worldInfo: worldInfo,
        playerStates: playerStates,
        objectStates: [],
    }

    const worldStateMessage: WorldStateMessage = {
        type: "WorldStateMessage",
        data: worldState,
    }

    console.log(JSON.stringify(worldStateMessage))

    webSocketServer.clients.forEach((webSocketClient) => {
        if (webSocketClient.readyState !== WebSocket.OPEN) return
        webSocketClient.send(JSON.stringify(worldStateMessage))
    })
}

webSocketServer.on("error", (error: Error) => {
    log(`Server received error: ${error}`)
})

webSocketServer.on("close", () => {
    log(`Server closed connection`)
})

apiServer.listen(API_SERVER_PORT, () => {
    log(`API server is listening for connections...`)
})

apiServer.get("/", (req, res) => {
    res.json({
        players: gameSession.players.map((player) => player.state),
    })
})

// Stop webSocketServer if user manually closes the webSocketServer (Control + C)
process.on("SIGINT", () => {
    process.exit()
})
