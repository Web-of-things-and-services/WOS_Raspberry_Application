const config = require("../etc/config.json")
const RaspberryClient = require("./RaspberryClient");
const getSenseHat = require("./getSenseHat");

let client = new RaspberryClient(config)
client.run()

process.on("SIGINT", () => {
    let leds = getSenseHat()
    leds.clear()
    process.exit()
})