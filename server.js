import { WebSocketServer } from "ws"
import express from "express"
import { nanoid } from "nanoid"
import GameSession from "./gameSession.js"
import { log } from "./utils.js"

const WEBSOCKET_SERVER_PORT = 3000
const API_SERVER_PORT = 3001

const webSocketServer = new WebSocketServer({port: WEBSOCKET_SERVER_PORT})
const apiServer = express()
const gameSession = new GameSession

webSocketServer.on('listening', () => {
    log(`Websocket server is listening for connections...`)
})

webSocketServer.on('connection', (socket) => {
    socket.id = nanoid(6)
    log(`New client connecting with socket id ${socket.id}`)
    socket.on('message', (message) => {
        gameSession.processMessage(message, socket)
    })
    socket.on('error', (error) => {
        log(`Server received error from socket:`, error)
    })
})

webSocketServer.on('error', (error) => {
    log(`Server received error: ${error}`)
})

webSocketServer.on('close', () => {
    log(`Server closed connection`)
})

apiServer.listen(API_SERVER_PORT, () => {
    log(`API server is listening for connections...`)
})

apiServer.get('/', (req, res) => {
    res.json({
        "players": gameSession.players,
        "sceneDiscovery": gameSession.sceneDiscovery
    })
})

// Stop webSocketServer if user manually closes the webSocketServer (Control + C)
process.on('SIGINT', () => {
    process.exit()
})
