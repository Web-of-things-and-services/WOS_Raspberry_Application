class ColumnFullException extends Error {
    constructor(number_of_lines, actual_number) {
        super(`Column is full (${actual_number} lines filled/${number_of_lines}) ! You can't place a token here.`);
    }
}

class Column {
    numberOfLines = null
    symbols = null
    index = null
    baseSymbol = null

    constructor(index, numberOfLines, baseSymbol) {
        this.index = index
        this.numberOfLines = numberOfLines
        this.baseSymbol = baseSymbol
        this.symbols = Array(numberOfLines).fill(baseSymbol)
    }

    /**
     * Takes a symbol, places it in the column, and returns the line at which it was placed. Throws a ColumnFullException if
     * the column is full.
     * @param symbol - Symbol to put in the column
     * @returns {number} - Line at which it was placed
     */
    playMove(symbol) {
        for (let row = 0; row < this.symbols.length; row++) {
            if (this.symbols[row] === this.baseSymbol) {
                this.symbols[row] = symbol
                return row
            }
        }
        //on a pas trouvé de row avec un symbole de base, donc la colonne est pleine et y'a une erreur
        throw new ColumnFullException(this.numberOfLines, this.symbols.length)

    }
}

module.exports = Column