import { log } from "./utils.js"

export default class GameSession {
    constructor() {
        this.players = []
        this.sceneDiscovery = null
    }

    processMessage(unparsedMessage) {
        const message = JSON.parse(unparsedMessage)
        switch (message.method) {
            case 'player_registration':
                log(`Registering player ${message.playerId}`)
                const newPlayer = {
                    id: message.playerId,
                    type: message.data.playerType,
                    name: message.data.playerName
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
