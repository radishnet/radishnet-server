import { Data, WebSocket, WebSocketServer } from "ws"
import { nanoid } from "nanoid"
import { VRPlayer, GuiClient, WebSocketWithId, WorldState, WorldStateMessage, WorldInfo, ObjectState, PlayerState } from "./types.js"
import { log } from "./utils.js"

const GUI_CLIENT_SERVER_PORT = 3001
const SEND_WORLD_STATE_TO_GUI_CLIENTS_HZ = 1

export default class GuiClientServer {
    vrPlayers: VRPlayer[]
    guiClients: GuiClient[]
    webSocketServer: WebSocketServer
    sendWorldStateInterval: NodeJS.Timeout

    constructor(vrPlayers: VRPlayer[], guiClients: GuiClient[]) {
        this.vrPlayers = vrPlayers
        this.guiClients = guiClients
        this.webSocketServer = new WebSocketServer({ port: GUI_CLIENT_SERVER_PORT })
        this.webSocketServer.on("listening", () => {
            log(`GuiClientServer is listening for connections...`)
        })
        this.webSocketServer.on("connection", (socket: WebSocketWithId) => {
            socket.id = nanoid(6)
            this.addGuiClient(socket)
            this.bindSocketEvents(socket)
        })
        this.webSocketServer.on("error", (error: Error) => {
            log(`VrPlayerServer received error: ${error}`)
        })
        this.webSocketServer.on("close", () => {
            log(`VrPlayerServer closed connection`)
        })
        this.startSendWorldStateInterval()
    }

    private addGuiClient(socket: WebSocketWithId) {
        const newGuiClient: GuiClient = {
            socket: socket,
        }
        this.guiClients.push(newGuiClient)
        log(`Added GUI Client "${socket.id}"`)
        this.logAllCurrentConnections()
    }

    private bindSocketEvents(socket: WebSocketWithId) {
        socket.on("message", (message: Data) => {
            this.processMessage(message, socket)
        })
        socket.on("error", (error: Error) => {
            log(`GuiClientServer received error from socket:` + error)
        })
        socket.on("close", () => {
            log(`Socket ${socket.id} closed`)
            this.removeGuiClient(socket.id)
        })
    }

    private processMessage(unparsedMessage: Data, socket: WebSocketWithId) {
        const message = JSON.parse(unparsedMessage.toString())
        // TODO: update messages obtained from GUI clients
        // switch (message.type) {
        // case "PlayerStateMessage":
        //     // console.warn(message)
        //     const player = this.guiClients.find((player) => player.socket.id === socket.id)
        //     player.state = message.payload
        //     break
        // default:
        //     console.warn(`Unknown message type: ${message.type}`)
        //     break
        // }
    }

    private removeGuiClient(socketId: string) {
        const indexOfGuiClientToRemove = this.guiClients.findIndex((guiClient) => guiClient.socket.id === socketId)
        this.guiClients.splice(indexOfGuiClientToRemove, 1)
        log(`Removed GUI Client "${socketId}"`)
        this.logAllCurrentConnections()
    }

    private startSendWorldStateInterval() {
        this.sendWorldStateInterval = setInterval(
            () => {
                this.sendWorldStateToGuiClients()
            },
            (1 / SEND_WORLD_STATE_TO_GUI_CLIENTS_HZ) * 1000
        )
    }

    private sendWorldStateToGuiClients() {
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

    private logAllCurrentConnections() {
        const allCurrentVRPlayerConnections = this.vrPlayers.map((vrPlayer) => vrPlayer.socket.id).join(", ")
        const allCurrentGuiClientConnections = this.guiClients.map((guiClient) => guiClient.socket.id).join(", ")
        log(`Current VR Players: ${allCurrentVRPlayerConnections} | Current GUI Clients: ${allCurrentGuiClientConnections}`)
    }
}
