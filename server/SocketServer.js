class SocketServer {

    static app = require('express')();
    static http = require('http').createServer(SocketServer.app);
    static io = require('socket.io')(SocketServer.http);

    /**
     * Map of connected sockets of the form id->socket
     * This property isn't maintained by the class, but should be maintained
     * in it's connection/disconnection event listeners, wherever they are
     * declared.
     */
    static sockets = {};
    /**
     * Map of usernames of the form id->username
     * This property isn't maintained by the class, but should be maintained
     * in it's connection/disconnection event listeners, wherever they are
     * declared.
     */
    static usernames = {};

    static emit(key, data) {
        SocketServer.io.emit(key, data);
    }

    static emitTo(id, key, data) {
        SocketServer.sockets[id].emit(key, data);
    }

    static emitExcept(id, key, data) {
        SocketServer.sockets[id].broadcast.emit(key, data);
    }

    /**
     * Listens for an event from the server and executes a function on event.
     * @param {string} key 
     * @param {function} callback 
     */
    static on(key, callback) {
        SocketServer.io.on(key, callback);
    }
}

module.exports = SocketServer;