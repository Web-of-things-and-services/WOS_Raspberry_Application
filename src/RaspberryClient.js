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
            reconnectionAttempts: 3,
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

    addBasicListeners() {
        this.socket.onAny((event, ...args) => {
            console.log(`Client received : ${event} with`, args)
        })

        this.socket.on("connect_error", (error) => {
            console.log(`Connexion error ${error}`)
            //afficher erreur sur raspberry
        })

        this.socket.on("disconnect", () => {
            console.log("Disconnection received")
            //deconnexion du serveur
        })
    }

    run() {
        console.log("Connecting the socket")
        this.socket.connect()
        this.socket.emit("connect_player", this.default_username);
    }
}

module.exports = RaspberryClient