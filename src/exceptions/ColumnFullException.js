class ColumnFullException extends Error {
    constructor(number_of_lines, actual_number) {
        super(`Column is full (${actual_number} lines filled/${number_of_lines}) ! You can't place a token here.`);
    }
}

module.exports = ColumnFullException