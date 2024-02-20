import VrPlayerServer from "./vr-player-server.js"
import GuiClientServer from "./gui-client-server.js"
import { GuiClient, VRPlayer } from "./types.js"

const vrPlayers: VRPlayer[] = []
const guiClients: GuiClient[] = []

const vrPlayerServer = new VrPlayerServer(vrPlayers, guiClients)
const guiClientServer = new GuiClientServer(vrPlayers, guiClients)
