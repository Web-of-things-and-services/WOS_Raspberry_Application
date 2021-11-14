class ColumnFullException extends Error {
    constructor() {
        super("Column is full ! You can't place a token here.");
    }
}

class Column {
    size = null
    symbols = []

    constructor(size) {
        this.size = size
    }

    /**
     * Takes a symbol, places it in the column, and returns the line at which it was placed. Throws a ColumnFullException if
     * the column is full.
     * @param symbol - Symbol to put in the column
     * @returns {number} - Line at which it was placed
     */
    playMove(symbol) {
        if (symbol.length > this.size) {
            throw new ColumnFullException()
        }
        this.symbols.push(symbol)
        return this.symbols.length - 1
    }

    clear() {
        this.symbols = []
    }
}

module.exports = Column