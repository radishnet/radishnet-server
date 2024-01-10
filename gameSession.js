import { log } from "./utils.js"

export default class GameSession {
    constructor() {
        this.players = []
        this.sceneDiscovery = null
    }

    processMessage(unparsedMessage, socket) {
        const message = JSON.parse(unparsedMessage)
        switch (message.method) {
            case 'player_registration':
                log(`Registering player ${message.playerId} with type ${message.data.playerType} on socket id ${socket.id}`)
                const newPlayer = {
                    playerId: message.playerId,
                    playerType: message.data.playerType,
                    socketId: socket.id
                }
                this.players.push(newPlayer)
                break
            case 'scene_discovery':
                log('Received scene discovery message')
                if (this.sceneDiscovery !== null) {
                    log('Scene Discovery already sent; ignoring this one.')
                    return
                }
                this.sceneDiscovery = message.data
                break
            default:
                console.warn(`Unknown message method: ${message.method}`)
                break
        }
    }
}
