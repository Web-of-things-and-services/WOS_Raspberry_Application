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

    base_symbol = "."
    red_symbol = "R"
    yellow_symbol = "Y"

    game_started = false
    game_array = []

    constructor(socket, LEDs, joystick) {
        this.socket = socket
        this.addGameListeners()

        this.LEDs = LEDs
        this.initGameArray()
        this.LEDs.sync.clear(this.base_color)

        this.joystick = joystick
        this.joystick.on("press", (direction) => {
            console.log('Got button press in the direction: ', direction);
        })
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

            console.log(`Row ${row} (${myRow.length}) : ${myRow}`)
            matrix.unshift(...myRow)
        }

        for (let fillRow = 0; fillRow < this.sense_leds_size - this.number_of_lines; fillRow++ ) {
            let rowConstructed = Array(this.sense_leds_size).fill(this.base_symbol)
            console.log(`Fill row ${fillRow} : ${rowConstructed}`)
            matrix.unshift(...rowConstructed)
        }

        return matrix.map((symbol) => {
            return this.getRGBColor(symbol)
        })
    }

    addGameListeners() {
        this.socket.on("new_move", (payload) => {
            console.log(`New move received : `, payload)
            this.LEDs.sync.showMessage(`Coup recu`, 0.05)
            this.playInColumn(payload.column, payload.symbol)
            this.LEDs.sync.setPixels(this.createPixelsMatrix())
        })

        this.socket.on("game_status", (payload) => {
            console.log(`Game status received : ${payload}`)
            //voir si partie en cours sinon echec
        })

        this.socket.on("start_game", () => {
            this.LEDs.sync.showMessage(`Début de partie imminent!`, 0.01)
            //débuter la partie
        })

        this.socket.on("waiting_move", () => {
            this.LEDs.sync.showMessage(`A ton tour !`, 0.01)
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