var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

// List of user ids
var idList = [];
// Map of usernames to socket ids
var idMap = {};
// Map of socket ids to usernames
var userMap = {};
// Socket ID of the vip player
var vipPlayer = '';
// Number of players connected
var numPlayers = 0;

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

    // Add the socket id to the id list
    idList.push(socket.id);
    // Check if the player is vip
    if (numPlayers < 1)
        vipPlayer = socket.id;
    numPlayers++;
    // Add the player to username<->id maps
    let uname = socket.handshake.query.username
    idMap[uname] = socket.id;
    userMap[socket.id] = uname;

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

    // Remove the socket id from the id list
    let index = idList.indexOf(socket.id);
    if (index > -1) {
        idList.splice(index, 1);
    }
    numPlayers--;
    // Remove the player from username<->id maps
    let uname = userMap[socket.id];
    delete idMap[uname];
    delete userMap[socket.id];
}

/**
 * This is really just a test to make sure the client can emit to server.
 * @param socket 
 */
const onGreeting = function (socket) {
    // Log the greeting from the client
    console.log(socket.id, "says hello!");
}

const printConnections = function () {
    // Print the status of players connected
    console.log("\n# of Players: ", numPlayers);
    console.log(idList);
    console.log(idMap);
    console.log(userMap, '\n');
}

// Start the server
initializeServer();
