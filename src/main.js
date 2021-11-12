const config = require("../etc/config.json")
const {RaspberryClient} = require("./RaspberryClient");

let client = new RaspberryClient(config)
client.run()