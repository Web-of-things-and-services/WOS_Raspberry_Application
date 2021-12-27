async function getJoystick() {
    let joystick_object = null
    await require("sense-joystick").getJoystick().then((joystick) => {
        joystick_object = joystick
    }).catch((reason) => {
        console.log("Error when loading sense-joystick : ", reason)
        joystick_object = new class fake_joystick {
            on (event, callback) {
                console.log("faux listener initialisé '" + event + "'", callback)
            }
        }
    })
    return joystick_object
}

module.exports = getJoystick