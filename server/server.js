var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

/**
 * Starts up the server and opens the listener
 */
const initializeServer = function () {
    // Add a listener for new user connections
    io.on('connection', onConnection);
    // Start the server's listener
    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
}

/**
 * Handles the initial connection of a new user.
 * @param socket 
 */
const onConnection = function (socket) {
    // Log that a user has joined
    console.log('A user connected:', socket.id);
    // Add a disconnect handler for the new user
    socket.on('disconnect', () => { onDisconnect(socket) });
    // Add a handler if the user sends greeting
    socket.on('greeting', () => { onGreeting(socket) });
}

/**
 * Handles the disconnection of a user.
 * @param socket 
 */
const onDisconnect = function (socket) {
    // Log that a user has left
    console.log('A user disconnected:', socket.id);
}

/**
 * This is really just a test to make sure the client can emit to server.
 * @param socket 
 */
const onGreeting = function (socket) {
    // Log the greeting from the client
    console.log(socket.id, "says hello!");
}

// Start the server
initializeServer();
