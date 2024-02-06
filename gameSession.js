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
        log(message)
        switch (message.method) {
            case 'player_state':
                log('Got player state message')
                break
            default:
                console.warn(`Unknown message method: ${message.method}`)
                break
        }
    }

    removePlayer(socketId) {
        log(`Socket ${socketId} closed, removing corresponding player`)

        this.players = this.players.filter((player) => {
            return player.socket.id !== socketId
        })
    }
}
