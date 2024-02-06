import { log } from "./utils.js"

export default class GameSession {
    constructor() {
        this.players = []
    }

    addPlayer(socket) {
        const newPlayer = {
            state: null,
            socket: socket,
        }
        this.players.push(newPlayer)
    }

    processMessage(unparsedMessage, socket) {
        const message = JSON.parse(unparsedMessage)
        switch (message.method) {
            case 'player_state':
                const player = this.players.find((player) => player.socket.id === socket.id)
                player.state = message.data
                break
            default:
                console.warn(`Unknown message method: ${message.method}`)
                break
        }
    }

    removePlayer(socketId) {
        log(`Socket ${socketId} closed, removing corresponding player`)
        this.players = this.players.filter(player => player.socket.id !== socketId)
    }
}
