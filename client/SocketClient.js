const io = require('socket.io-client');

class SocketClient {
    static socket = null;

    /**
     * Connects to a given ip and port
     * @param {string} ip 
     * @param {number} port 
     */
    static connectTo(ip, port) {
        console.log('http://' + ip + ':' + port.toString());
        this.socket = io('http://' + ip + ':' + port.toString());
    }

    /**
     * Sends a message and data argument to the server
     * @param {string} key 
     * @param {any} data 
     */
    static emit(key, data) {
        if (this.socket) {
            this.socket.emit(key, data);
        }
    }

    /**
     * Listens for an event from the server and executes a function on event.
     * @param {string} key 
     * @param {function} callback 
     */
    static on(key, callback) {
        if (this.socket) {
            this.socket.on(key, callback);
        }
    }
}

module.exports = SocketClient;