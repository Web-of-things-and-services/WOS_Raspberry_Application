const Column = require("./Column")
const getSenseHat = require("./getSenseHat")
const io = require("socket.io-client");
const ColumnFullException = require("./exceptions/ColumnFullException");

let LEDs = getSenseHat()

class GameHandler {
    sense_leds_size = 8
    number_of_lines = 6
    number_of_column = 7

    base_color = [255, 255, 255]
    red_color = [255, 0, 0]
    yellow_color = [255, 255, 0]

    base_symbol = "B"
    red_symbol = "R"
    yellow_symbol = "Y"

    game_started = false
    game_array = []
    waiting_move = false

    constructor() {
        this.initGameArray()
        this.setLedsFromGameArray()
        LEDs.clear(this.base_color)
        console.log("Game handler initialized : ", this.game_array)
    }

    playInColumn(column_index, symbol) {
        if (column_index >= this.number_of_column) {
            console.log(`Column number received is too big ! Received ${column_index} when max is ${this.number_of_column - 1} (${this.number_of_column} columns in the game)`)
            return
        }
        console.log(`Column ${column_index - 1} : `, this.game_array[column_index - 1])
        console.log(`Column ${column_index} : `, this.game_array[column_index])
        try {
            this.game_array[column_index].playMove(symbol)
            this.setLedsFromColumn(column_index, this.game_array[column_index])
            console.log("Game handler updated : ", this.game_array)
        } catch (err) {
            console.log("Error when playing in column : ", err.message)
        }
    }

    setLedsFromGameArray() {
        for (const [index, column] of this.game_array.entries()) {
            this.setLedsFromColumn(index, column)
        }
    }

    setLedsFromColumn(column_index, column) {
        let full_column = column.symbols.concat(new Array(this.number_of_lines - column.symbols.length).fill(this.base_symbol))
        for (const [line_index, symbol] of full_column.entries()) {
            LEDs.setPixel(column_index, this.sense_leds_size - 1 - line_index, this.getRGBColor(symbol))
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

    /*fillGameArrayWithSymbol(symbol) {
        for (let column_index = 0; column_index < this.number_of_columns; column_index++) {
            let column = []
            for (let line_index = 0; line_index < this.number_of_lines; line_index++) {
                column[line_index] = symbol
            }
            this.game_array[column_index] = column
        }
    }*/

    initGameArray() {
        for (let column_index = 0; column_index < this.number_of_column; column_index++) {
            this.game_array.push(new Column(this.number_of_lines))
        }
    }
}

module.exports = GameHandler