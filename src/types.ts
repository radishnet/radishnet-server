import { WebSocket } from "ws"

export type Client = {
    clientType: ClientType
    socket: WebSocketWithId
    state?: PlayerState
}

export type ClientType = "vr" | "gui"

export type WebSocketWithId = WebSocket & {
    id: string
}

export type PlayerState = {
    clientId: string
    headPosition: {
        x: number
        y: number
        z: number
    }
    headRotation: {
        x: number
        y: number
        z: number
        w: number
    }
}

export type Message<T> = {
    type: string
    payload: T
}

export type ClientIdMessage = Message<string>

export type WorldStateMessage = Message<WorldState>

export type WorldState = {
    worldInfo: WorldInfo
    playerStates: PlayerState[]
    objectStates: ObjectState[]
}

export type WorldInfo = {
    weather: string
}

export type ObjectState = {}
