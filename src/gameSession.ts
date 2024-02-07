import { Data } from "ws"
import { log } from "./utils.js"
import { Player, WebSocketWithId } from "./types.js"

export default class GameSession {
    players: Player[]

    constructor() {
        this.players = []
    }

    addPlayer(socket: WebSocketWithId) {
        const newPlayer: Player = {
            state: null,
            socket: socket,
        }
        this.players.push(newPlayer)
    }

    processMessage(unparsedMessage: Data, socket: WebSocketWithId) {
        const message = JSON.parse(unparsedMessage.toString())
        switch (message.type) {
            case "PlayerStateMessage":
                const player = this.players.find((player) => player.socket.id === socket.id)
                player.state = message.data
                break
            default:
                console.warn(`Unknown message type: ${message.type}`)
                break
        }
    }

    removePlayer(socketId) {
        log(`Socket ${socketId} closed, removing corresponding player`)
        this.players = this.players.filter((player) => player.socket.id !== socketId)
    }
}
