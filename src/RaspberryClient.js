import {GameHandler} from "./GameHandler";

const io = require('socket.io-client');

export class RaspberryClient {
    default_username = "Raspberry"
    socket = null
    gameHandler = null

    constructor(config) {
        this.socket = io(`${config.server.address}:${config.server}`, {
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            autoConnect: false
        })

        this.gameHandler = new GameHandler()

        this.addBasicListeners()
        this.addGameListeners()
    }

    addBasicListeners() {
        this.socket.onAny((event, ...args) => {
            console.log(`Client received : ${event} with ${args}`)
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

    addGameListeners() {
        this.socket.on("new_move", (payload) => {
            console.log(`New move received : ${payload}`)
            this.gameHandler.playInColumn(payload.column, "R")
            //jouer le coup sur le plateau
        })

        this.socket.on("game_status", (payload) => {
            console.log(`Game status received : ${payload}`)
            //voir si partie en cours sinon echec
        })

        this.socket.on("start_game", () => {
            console.log(`Start game received`)
            //débuter la partie
        })

        this.socket.on("waiting_move", () => {
            console.log(`Waiting move received`)
            //idniquer qu'on attend un coup, attendre input raspberry
        })

        this.socket.on("stop_game", () => {
            console.log(`Stop game received : ${payload}`)
            //mettre fin à la partie
            //indiquer sur la raspberry que la partie a été arrêtée par un admin
        })

        this.socket.on("end_game", (pseudo) => {
            console.log(`End game received : ${pseudo}`)
            //mettre fin à la partie
            //indiquer si on a gagné ou perdu la partie
        })

        this.socket.on("message", (message) => {
            console.log(`Message received : ${message}`)
            //afficher message peu importe ce que c'est
        })
    }

    run() {
        this.socket.connect()
    }
}