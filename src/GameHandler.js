const {Column} = require("./Column")

const io = require("socket.io-client");
const LEDs = require("sense-hat-led")

class GameHandler {
    sense_leds_size = 8
    number_of_lines = 6
    number_of_columns = 7

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
    }

    playInColumn(column_index, symbol) {
        this.game_array[column_index].playMove(symbol)
        this.setLedsFromColumn(column_index, this.game_array[column_index])
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
        for (let column_index = 0; column_index < this.number_of_columns; column_index++) {
            this.game_array.push(new Column(this.number_of_lines))
        }
    }
}