import { Data, WebSocket, WebSocketServer } from "ws"
import { nanoid } from "nanoid"
import { VRPlayer, GuiClient, WebSocketWithId, WorldState, WorldStateMessage, WorldInfo, ObjectState, PlayerState, PlayerIdMessage } from "./types.js"
import { log } from "./utils.js"

const VR_PLAYER_SERVER_PORT = 3000
const SEND_WORLD_STATE_TO_VR_PLAYERS_HZ = 1

export default class VrPlayerServer {
    vrPlayers: VRPlayer[]
    guiClients: GuiClient[]
    webSocketServer: WebSocketServer
    sendWorldStateInterval: NodeJS.Timeout

    constructor(vrPlayers: VRPlayer[], guiClients: GuiClient[]) {
        this.vrPlayers = vrPlayers
        this.guiClients = guiClients
        this.webSocketServer = new WebSocketServer({ port: VR_PLAYER_SERVER_PORT })
        this.webSocketServer.on("listening", () => {
            log(`VrPlayerServer is listening for connections...`)
        })
        this.webSocketServer.on("connection", (socket: WebSocketWithId) => {
            socket.id = nanoid(6)
            this.addVRPlayer(socket)
            this.bindSocketEvents(socket)
            this.sendPlayerId(socket)
        })
        this.webSocketServer.on("error", (error: Error) => {
            log(`VrPlayerServer received error: ${error}`)
        })
        this.webSocketServer.on("close", () => {
            log(`VrPlayerServer closed connection`)
        })
        this.startSendWorldStateInterval()
    }

    private addVRPlayer(socket: WebSocketWithId) {
        const newVRPlayer: VRPlayer = {
            socket: socket,
            state: null,
        }
        this.vrPlayers.push(newVRPlayer)
        log(`Added VR Player "${socket.id}". Currently connected VR Players: "${this.getCurrentlyConnectedVrPlayersString()}"`)
    }

    private bindSocketEvents(socket: WebSocketWithId) {
        socket.on("message", (message: Data) => {
            this.processMessage(message, socket)
        })
        socket.on("error", (error: Error) => {
            log(`VrPlayerServer received error from socket:` + error)
        })
        socket.on("close", () => {
            log(`Socket ${socket.id} closed, removing corresponding VR player`)
            this.removeVRPlayer(socket.id)
        })
    }

    private sendPlayerId(socket: WebSocketWithId) {
        const playerIdMessage: PlayerIdMessage = {
            type: "PlayerIdMessage",
            payload: socket.id,
        }
        socket.send(JSON.stringify(playerIdMessage))
    }

    private processMessage(unparsedMessage: Data, socket: WebSocketWithId) {
        const message = JSON.parse(unparsedMessage.toString())
        switch (message.type) {
            case "PlayerStateMessage":
                // console.warn(message)
                const player = this.vrPlayers.find((player) => player.socket.id === socket.id)
                player.state = message.payload
                break
            default:
                console.warn(`Unknown message type: ${message.type}`)
                break
        }
    }

    private removeVRPlayer(socketId: string) {
        this.vrPlayers = this.vrPlayers.filter((player) => player.socket.id !== socketId)
        log(`Removed VR Player "${socketId}". Currently connected VR Players: "${this.getCurrentlyConnectedVrPlayersString()}"`)
    }

    private startSendWorldStateInterval() {
        this.sendWorldStateInterval = setInterval(
            () => {
                this.sendWorldStateToVRPlayers()
            },
            (1 / SEND_WORLD_STATE_TO_VR_PLAYERS_HZ) * 1000
        )
    }

    private sendWorldStateToVRPlayers() {
        const worldState = this.getWorldState()
        const worldStateMessage: WorldStateMessage = {
            type: "WorldStateMessage",
            payload: worldState,
        }
        this.webSocketServer.clients.forEach((webSocketClient) => {
            if (webSocketClient.readyState !== WebSocket.OPEN) return
            webSocketClient.send(JSON.stringify(worldStateMessage))
        })
    }

    private getWorldState(): WorldState {
        const worldInfo: WorldInfo = {
            weather: "sunny",
        }
        const playerStates: PlayerState[] = this.vrPlayers.map((vrPlayer) => ({
            id: vrPlayer.socket.id,
            ...vrPlayer.state,
        }))
        const objectStates: ObjectState[] = []
        const worldState: WorldState = {
            worldInfo: worldInfo,
            playerStates: playerStates,
            objectStates: objectStates,
        }
        return worldState
    }

    private getCurrentlyConnectedVrPlayersString() {
        return this.vrPlayers.map((vrPlayer) => vrPlayer.socket.id).join(", ")
    }
}
