const config = require("../etc/config.json")
const RaspberryClient = require("./RaspberryClient");
const getSenseHat = require("./getSenseHat");

let client = new RaspberryClient(config)
client.run()

process.on("SIGINT", () => {
    let LEDs = getSenseHat()
    LEDs.showMessage(`Programme interrompu`, 0.1)
    LEDs.clear()
    process.exit()
})