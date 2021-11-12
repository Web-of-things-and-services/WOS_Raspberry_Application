const io = require('socket.io-client');

export class RaspberryClient {
    constructor(config) {
        this.socket = io(`${config.server.address}:${config.server}`, {
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        })
    }

    run() {

    }
}








function addBasicListenersToSocket(socket) {

}

function runClient() {
    const socket = io.connect(`${config.server.address}:${config.server}`)
    addBasicListenersToSocket(socket)
}

runClient()