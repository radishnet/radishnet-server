import { WebSocket } from "ws"

export type VRPlayer = {
    socket: WebSocketWithId
    state: PlayerState
}

export type GuiClient = {
    socket: WebSocketWithId
}

export type WebSocketWithId = WebSocket & {
    id: string
}

export type PlayerState = {
    id: string
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

export type PlayerIdMessage = Message<string>

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
