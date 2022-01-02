const config = require("../etc/config.json")
const RaspberryClient = require("./RaspberryClient");
const getSenseHat = require("./getSenseHat");

let client = new RaspberryClient(config)
client.run()

process.on("SIGINT", () => {
    let LEDs = getSenseHat()
    LEDs.sync.showMessage(`EXIT`, 0.1, [241, 56, 56])
    LEDs.sync.clear([0, 0, 0])
    process.exit()
})