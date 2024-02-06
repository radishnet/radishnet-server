import { log } from "./utils.js"

export default class GameSession {
    constructor() {
        this.players = []
        this.sceneDiscovery = null
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
}
