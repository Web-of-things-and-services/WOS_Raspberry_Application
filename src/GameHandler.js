const Column = require("./Column")

class GameHandler {
    ledsMatrixSize = 8
    gameMatrixNumberOfRows = 6
    gameMatrixNumberOfColumns = 7

    rgbBase = [0, 0, 0]
    rgbRed = [241, 56, 56]
    rgbYellow = [240, 243, 58]
    rgbGreen = [8, 169, 0]
    rgbJoystick = [0, 0, 255]
    rgbJoystickBackground = [100, 100, 100]

    symbolBase = "."
    symbolRed = "R"
    symbolYellow = "Y"
    symbolGreen = "G"
    symbolJoystick = "JOYSTICK"
    symbolJoystickBackground = "JOYSTICK_BG"

    gameStarted = false
    gameArray = []
    waitingJoystickInput = false
    joystickXPosition = 0

    constructor(socket, LEDs, joystick) {
        this.socket = socket
        this.addGameListeners()

        this.LEDs = LEDs
        this.initGameArray()
        this.LEDs.sync.clear(this.rgbBase)

        this.joystick = joystick
    }

    /**
     * Jouer un coup dans une colonne
     * @param columnIndex
     * @param symbol
     */
    playInColumn(columnIndex, symbol) {
        try {
            this.gameArray[columnIndex].playMove(symbol)
        } catch (err) {
            console.log("Error when playing in column : ", err.message)
        }
    }

    /**
     * Obtenir la valeur RGB correspondante à un symbole
     * @param symbol
     * @returns {number[]|*}
     */
    getRGBColor(symbol) {
        if (Array.isArray(symbol) && symbol.length === 3) return symbol //already hexadecimal color
        switch (symbol) {
            case this.symbolYellow:
                return this.rgbYellow
            case this.symbolRed:
                return this.rgbRed
            case this.symbolGreen:
                return this.rgbGreen
            case this.symbolJoystick:
                return this.rgbJoystick
            case this.symbolJoystickBackground:
                return this.rgbJoystickBackground
            default:
                return this.rgbBase
        }
    }

    /**
     * Initialiser la variable avec le plateau de jeu à vide
     */
    initGameArray() {
        for (let column_index = 0; column_index < this.gameMatrixNumberOfColumns; column_index++) {
            this.gameArray.push(new Column(column_index, this.gameMatrixNumberOfRows, this.symbolBase))
        }
    }

    /**
     * Reset les valeurs de l'objet aux valeurs de départ
     */
    endGame() {
        this.gameStarted = false
        this.gameArray = []
        this.waitingJoystickInput = false
    }

    /**
     * Retourne un tableau/liste de la taille des LEDs à partir des valeurs de l'objet
     * @returns {(number[]|*)[]}
     */
    createPixelsMatrix() {
        let matrix = []

        //creation des lignes de la grille de jeu

        for (let row = 0; row < this.gameMatrixNumberOfRows; row++) {
            let myRow = []

            for (const col of this.gameArray) {
                try {
                    myRow.push(col.symbols[row])
                } catch (e) {
                    console.log(`Symbole à colonne ${col} et ligne ${row} existe pas`)
                    console.log(e)
                }
            }

            for (let fillColumns = 0; fillColumns < this.ledsMatrixSize - this.gameMatrixNumberOfColumns; fillColumns++) {
                myRow.push(this.symbolBase)
            }

            //console.log(`Row ${row} (${myRow.length}) : ${myRow}`)
            matrix.unshift(...myRow)
        }

        //creation des lignes entre l'emplacement du joystick et le jeu

        //-1 dans le for pour qu'on puisse créer la firstrow à la main ensuite (avec joystick indicateur)
        for (let fillRow = 0; fillRow < this.ledsMatrixSize - this.gameMatrixNumberOfRows - 1; fillRow++) {
            let rowConstructed = Array(this.ledsMatrixSize).fill(this.symbolBase)
            //console.log(`Fill row ${fillRow} : ${rowConstructed}`)
            matrix.unshift(...rowConstructed)
        }

        //creation de la première ligne de la matrice avec soit le joystick soit une ligne vide

        let firstRow
        if (this.waitingJoystickInput) {
            firstRow = Array(this.ledsMatrixSize).fill(this.symbolJoystickBackground)
            firstRow[this.joystickXPosition] = this.symbolJoystick
        } else {
            firstRow = Array(this.ledsMatrixSize).fill(this.symbolBase)
        }
        firstRow[this.ledsMatrixSize-1] = this.gameStarted ? this.symbolGreen : this.symbolRed;
        matrix.unshift(...firstRow)

        //transformation symboles en couleurs RGB
        return matrix.map((symbol) => {
            return this.getRGBColor(symbol)
        })
    }

    /**
     * Afficher l'entiereté de la matrice de leds avec les dernières valeurs du jeu
     */
    renderPixels() {
        let matrix = this.createPixelsMatrix()
        this.LEDs.sync.setPixels(matrix)
    }

    /**
     * Ajouter les listeners de socket.io pour les évènements relatifs au gameplay
     */
    addGameListeners() {
        this.socket.on("new_move", (payload) => {
            if (payload.name === this.socket.username) {
                return //pas ses propres events
            }
            this.LEDs.sync.showMessage(`Coup recu!`, 0.05)
            this.playInColumn(payload.column, "Y")
            this.renderPixels()
        })

        this.socket.on("start_game", () => {
            this.LEDs.sync.showMessage(`Début de partie imminent!`, 0.05)
            this.gameStarted = true
            this.endGame() //on remet le plateau à 0 au cas où
        })

        this.socket.on("display_turn_player", (nextPlayer) => {
            if (nextPlayer !== this.socket.username) {
                return
            }
            this.LEDs.sync.showMessage(`A ton tour !`, 0.05)
            this.joystickXPosition = Math.floor(this.ledsMatrixSize / 2)
            this.waitingJoystickInput = true
            this.joystick.on("press", (direction) => {
                switch (direction) {
                    case "click":
                        this.waitingJoystickInput = false
                        this.socket.emit("new_move", {column: this.joystickXPosition, name: this.socket.username})
                        this.playInColumn(this.joystickXPosition, this.symbolRed) //à changer par symbole de la raspberry
                        this.joystick._events = {} //le quel est le bon ?
                        this.joystick.press = {} //le quel est le bon ?
                        break;
                    case "right":
                        this.joystickXPosition = Math.min(this.gameMatrixNumberOfColumns - 1, this.joystickXPosition + 1)
                        break;
                    case "left":
                        this.joystickXPosition = Math.max(0, this.joystickXPosition - 1)
                        break;
                }
                this.renderPixels()
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