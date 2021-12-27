const Column = require("./Column")
const io = require("socket.io-client");
const ColumnFullException = require("./exceptions/ColumnFullException");

class GameHandler {
    sense_leds_size = 8
    number_of_lines = 6
    number_of_column = 7

    base_color = [0, 0, 0]
    red_color = [255, 0, 0]
    yellow_color = [255, 255, 0]
    joystick_color = [0, 0, 255]
    joystick_background_color = [255, 255, 255]

    base_symbol = "."
    red_symbol = "R"
    yellow_symbol = "Y"
    joystick_symbol = "JOYSTICK"
    joystick_background_symbol = "JOYSTICK_BG"

    game_started = false
    game_array = []
    waitingJoystickInput = false
    joystickXPosition = 0

    constructor(socket, LEDs, joystick) {
        this.socket = socket
        this.addGameListeners()

        this.LEDs = LEDs
        this.initGameArray()
        this.LEDs.sync.clear(this.base_color)

        this.joystick = joystick
    }

    playInColumn(column_index, symbol) {
        try {
            this.game_array[column_index].playMove(symbol)
        } catch (err) {
            console.log("Error when playing in column : ", err.message)
        }
    }

    getRGBColor(symbol) {
        if (Array.isArray(symbol) && symbol.length === 3) return symbol //already hexadecimal color
        switch (symbol) {
            case this.yellow_symbol:
                return this.yellow_color
            case this.red_symbol:
                return this.red_color
            case this.joystick_symbol:
                return this.joystick_color
            case this.joystick_background_symbol:
                return this.joystick_background_color
            default:
                return this.base_color
        }
    }

    initGameArray() {
        for (let column_index = 0; column_index < this.number_of_column; column_index++) {
            this.game_array.push(new Column(column_index, this.number_of_lines, this.base_symbol))
        }
    }

    endGame() {
        this.game_started = false
        this.game_array = []
        this.waitingJoystickInput = false
    }

    createPixelsMatrix() {
        let matrix = []

        for (let row = 0; row < this.number_of_lines; row++) {
            let myRow = []

            for (const col of this.game_array) {
                try {
                    myRow.push(col.symbols[row])
                } catch (e) {
                    console.log(`Symbole à colonne ${col} et ligne ${row} existe pas`)
                    console.log(e)
                }
            }

            for (let fillColumns = 0; fillColumns < this.sense_leds_size - this.number_of_column; fillColumns++) {
                myRow.push(this.base_symbol)
            }

            //console.log(`Row ${row} (${myRow.length}) : ${myRow}`)
            matrix.unshift(...myRow)
        }

        //-1 dans le for pour qu'on puisse créer la firstrow à la main ensuite (avec joystick indicateur)
        for (let fillRow = 0; fillRow < this.sense_leds_size - this.number_of_lines -  1; fillRow++ ) {
            let rowConstructed = Array(this.sense_leds_size).fill(this.base_symbol)
            //console.log(`Fill row ${fillRow} : ${rowConstructed}`)
            matrix.unshift(...rowConstructed)
        }

        let firstRow
        if (this.waitingJoystickInput) {
            firstRow = Array(this.sense_leds_size).fill(this.joystick_background_symbol)
            firstRow[this.sense_leds_size - 1] = this.base_symbol //dernier colonne impossible à jouer
            firstRow[this.joystickXPosition] = this.joystick_symbol
        } else {
            firstRow = Array(this.sense_leds_size).fill(this.base_symbol)
        }

        //console.log(`First row : ${firstRow}`)
        matrix.unshift(...firstRow)

        return matrix.map((symbol) => {
            return this.getRGBColor(symbol)
        })
    }

    renderPixels() {
        let matrix = this.createPixelsMatrix()
        this.LEDs.sync.setPixels(matrix)
    }

    addGameListeners() {
        this.socket.on("new_move", (payload) => {
            if (payload.name === this.socket.username) {
                return //pas ses propres events
            }
            console.log(`New move received : `, payload)
            this.LEDs.sync.showMessage(`Coup recu`, 0.05)
            this.playInColumn(payload.column, "Y")
            this.renderPixels()
        })

        this.socket.on("game_status", (payload) => {
            console.log(`Game status received : ${payload}`)
            //voir si partie en cours sinon echec
        })

        this.socket.on("start_game", () => {
            this.LEDs.sync.showMessage(`Début de partie imminent!`, 0.05)
            this.endGame() //on remet le plateau à 0 au cas où
        })

        this.socket.on("display_turn_player", (nextPlayer) => {
            if (nextPlayer !== this.socket.username) {
                return
            }
            this.LEDs.sync.showMessage(`A ton tour !`, 0.05)
            this.joystickXPosition = Math.floor(this.sense_leds_size/2)
            this.waitingJoystickInput = true
            this.joystick.on("press", (direction) => {
                switch (direction) {
                    case "click":
                        this.waitingJoystickInput = false
                        this.socket.emit("new_move", {column : this.joystickXPosition, name: this.socket.username})
                        this.playInColumn(this.joystickXPosition, this.red_symbol) //à changer par symbole de la raspberry
                        console.log(this.joystick.on)
                        console.log(this.joystick)
                        console.log(this.joystick._events)
                        console.log(this.joystick.press)
                        this.joystick._events = {}
                        this.joystick.press = {}
                        break;
                    case "right":
                        this.joystickXPosition = Math.min(this.number_of_column - 1, this.joystickXPosition  + 1)
                        break;
                    case "left":
                        this.joystickXPosition = Math.max(0, this.joystickXPosition - 1)
                        break;
                }
                this.renderPixels()
                console.log('Got button press in the direction: ', direction);
            })
            this.renderPixels()
        })

        this.socket.on("stop_game", () => {
            this.LEDs.sync.showMessage(`Partie annulée par un administrateur, aucun gagnant.`, 0.01)
            this.endGame()
        })

        this.socket.on("end_game", (pseudo) => {
            if (pseudo === this.socket.username) {
                this.LEDs.sync.showMessage(`Tu remportes la victoire ! Partie terminée.`, 0.01)
            } else {
                this.LEDs.sync.showMessage(`${pseudo} remporte la victoire ! Partie terminée.`, 0.01)
            }
            this.endGame()
        })

        this.socket.on("message", (message) => {
            this.LEDs.sync.showMessage(message, 0.01)
        })
    }
}

module.exports = GameHandler