function getSenseHat() {
    try {
        return require("sense-hat-led")
    } catch (err) {
        console.log("Error when loading sense-hat : ", err.message)
        return new class fake_raspberry {
            setPixel(p1, p2, p3) {
                console.log("function setpixel")
                console.log(p1,p2,p3)
            }

            clear(p1) {
                console.log("function clear")
                console.log(p1)
            }
        }
    }
}

module.exports = getSenseHat