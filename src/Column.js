const ColumnFullException = require("./exceptions/ColumnFullException");

class Column {
    number_of_lines = null
    symbols = []

    constructor(number_of_lines) {
        this.number_of_lines = number_of_lines
    }

    /**
     * Takes a symbol, places it in the column, and returns the line at which it was placed. Throws a ColumnFullException if
     * the column is full.
     * @param symbol - Symbol to put in the column
     * @returns {number} - Line at which it was placed
     */
    playMove(symbol) {
        if (this.symbols.length >= this.number_of_lines) {
            throw new ColumnFullException(this.number_of_lines, this.symbols.length)
        }
        this.symbols.push(symbol)
        return this.symbols.length - 1
    }
}

module.exports = Column