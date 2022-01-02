function getSenseHat() {
    try {
        return require("sense-hat-led")
    } catch (err) {
        console.log("Error when loading sense-hat : ", err.message)
        return new class fake_raspberry {
            sync = new class Sync {
                showMessage(message, temps) {
                    console.log(message, temps)
                }

                setPixels(pixels) {
                    console.log("setting pixels")
                    console.log(pixels)
                }
            }

            setPixel(p1, p2, p3) {
                console.log("function setpixel")
                console.log(p1, p2, p3)
            }

            clear(p1) {
                console.log("function clear")
                console.log(p1)
            }

            showMessage(message, scrollSpeed) {
                console.log("Message défilant sur Raspberry : " + message)
            }

        }
    }

}

module.exports = getSenseHat