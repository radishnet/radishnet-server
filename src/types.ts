import { WebSocket } from "ws"

export type Player = {
    state: PlayerState
    socket: WebSocketWithId
}

export type PlayerState = {
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

export type WebSocketWithId = WebSocket & {
    id: string
}

export type Message<T> = {
    type: string
    data: T
}

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
