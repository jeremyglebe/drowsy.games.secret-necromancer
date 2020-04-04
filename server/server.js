const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const readline = require('readline-promise').default;

// Game object classes
const Field = require('./game/Field');

// Host address
var host = 'localhost';
// Host port
var port = 3000;

// Create a reader object using readline
var reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
reader.questionAsync('Enter the host address: ').then((inputHost) => {
    reader.questionAsync('Enter the server\'s port: ').then((inputPort) => {
        // Assign the entered host and port if they aren't just blank
        if (inputHost.trim() != '')
            host = inputHost;
        if (inputPort.trim() != '')
            port = inputPort;
        // Start the server
        initializeServer();
    });
});

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
// Are we still "in the lobby", waiting for more players?
var lobby = true;
// Game field object
var field = null;

/**
 * Starts up the server and opens the listener
 */
const initializeServer = function () {
    // Add a listener for new user connections
    io.on('connection', onConnection);
    // Start the server's listener
    http.listen(port, host, function () {
        console.log('listening on ' + host + ':' + port);
    });
}

/**
 * Handles the initial connection of a new user.
 * @param socket 
 */
const onConnection = function (socket) {
    // Get the user's preferred username
    let username = socket.handshake.query.username;

    // Test for rejection of client
    if (testForRejection(socket))
        return;

    // Log that a user has joined
    console.log('A user connected:', socket.id);

    // Add the socket id to the id list
    idList.push(socket.id);
    // Check if the player is vip
    if (numPlayers < 1) {
        vipPlayer = socket.id;
    }
    numPlayers++;
    // Add the player to username<->id maps
    idMap[username] = socket.id;
    userMap[socket.id] = username;

    // Tell the user their connection was accepted
    if (socket.id == vipPlayer)
        socket.emit('accept connection', 'vip');
    else
        socket.emit('accept connection', 'player')

    // Update the player list for all clients
    setTimeout(() => {
        io.emit('update players', {
            usernames: Object.keys(idMap),
            vip: userMap[vipPlayer]
        });
    }, 25);

    // Add a disconnect handler for the new user
    socket.on('disconnect', () => { onDisconnect(socket) });
    // Add a handler if the user sends greeting
    socket.on('start', () => { onStart(socket) });
    // Add a handler if the user wants to start the game
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
    let username = userMap[socket.id];
    delete idMap[username];
    delete userMap[socket.id];
}

/**
 * If the VIP player tells the server to start the game, it responds by
 * creating a Field object and Players for each player.
 * @param socket 
 */
const onStart = function (socket) {
    if (socket.id == vipPlayer) {
        // Just print the status of the players
        printConnections();
        // Exit the lobby phase
        lobby = false;
        // Create the Field object
        field = new Field(Object.keys(idMap));
    }
    io.emit('start game', field);
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
    console.log("VIP: ", userMap[vipPlayer]);
    console.log(idList);
    console.log(idMap);
    console.log(userMap, '\n');
}

const testForRejection = function (socket) {
    // Get the user's preferred username
    let username = socket.handshake.query.username;

    // User rejection conditions
    if (!lobby) {
        // Reject the user if we've already left the lobby
        socket.emit('reject connection', 'Server not accepting players.');
        // Log that a user has been rejected
        console.log('User rejected:', socket.id,
            ' | Reason: Server not accepting players.');
        // Disconnect the user
        socket.disconnect(true);
        return true;
    }
    else if (numPlayers >= 5) {
        // Reject the user if there's already 5 players
        socket.emit('reject connection', 'Server is full.');
        // Log that a user has been rejected
        console.log('User rejected:', socket.id,
            ' | Reason: Server is full.');
        // Disconnect the user
        socket.disconnect(true);
        return true;
    } else if (username in idMap) {
        // Reject the user if their name is already taken
        socket.emit('reject connection', 'Username is already in use.');
        // Log that a user has been rejected
        console.log('User rejected:', socket.id,
            ' | Reason: Username is already in use.');
        // Disconnect the user
        socket.disconnect(true);
        return true;
    }

    return false;
}