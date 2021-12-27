const GameHandler = require("./GameHandler")
const {io} = require("socket.io-client");
const getSenseHat = require("./getSenseHat")
const getJoystick = require("./getJoystick")

class RaspberryClient {
    default_username = "Raspberry"
    socket = null
    gameHandler = null

    constructor(config) {
        this.socket = io(config.server.address, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            autoConnect: false
        })
        this.socket.username = this.default_username
        this.LEDs = getSenseHat()
        this.addBasicListeners()

        getJoystick().then((joystick) => {
            this.joystick = joystick
            this.gameHandler = new GameHandler(this.socket, this.LEDs, this.joystick)
        }).catch((reason) => {
            throw new Error("Erreur démarrage du jeu : " + reason)
        })
    }

    /**
     * Ajout listeners évènements basiques de socket.io
     */
    addBasicListeners() {
        this.socket.onAny((event, ...args) => {
            console.log(`Client received : ${event} with`, args)
        })

        this.socket.on("connect_error", (error) => {
            this.LEDs.sync.showMessage("Erreur de connexion", 0.05)
        })

        this.socket.on("disconnect", () => {
            this.LEDs.sync.showMessage("Deconnexion du serveur", 0.05)
        })
    }

    /**
     * Connexion de la socket au serveur et rejoindre la partie
     */
    run() {
        console.log("Connecting the socket")
        this.socket.connect()
        this.socket.emit("connect_player", this.default_username);
    }
}

module.exports = RaspberryClient