const server = require('../SocketServer');

// Socket ID of the vip player
var vipPlayer = '';
// Number of players connected
var numPlayers = 0;
// Are we still waiting for more players?
var lobby = true;

// Listener for: new user connections
server.on('connection', onConnection);

function onConnection(socket) {
    // Test whether we should reject the connection before we get started
    if (testForRejection(socket)) {
        return;
    }

    // Get the user's preferred username
    let username = socket.handshake.query.username;

    // Log that a user has joined
    console.log('A user connected: ' + username + ', ID: ' + socket.id);

    // Add the user to the server's socket and username maps
    server.sockets[socket.id] = socket;
    server.usernames[socket.id] = username;

    // Increment the number of players
    numPlayers++;

    // Determine if the user is the VIP
    if (numPlayers == 1) {
        vipPlayer = socket.id;
    }

    // Tell the user their connection was accepted, and if they're the VIP
    if (socket.id == vipPlayer)
        socket.emit('accept connection', 'vip');
    else
        socket.emit('accept connection', 'player')


    // Wait a moment, then update the player list for all clients
    setTimeout(() => {
        server.emit('update players', {
            usernames: Object.values(server.usernames),
            vip: server.usernames[vipPlayer]
        });
    }, 25);

    /** LISTENERS AND HANDLERS */
    // Add a disconnect handler for the new user
    socket.on('disconnect', () => { onDisconnect(socket) });
    // Add a handler if the user sends greeting
    socket.on('start', () => { onStart(socket) });
}

/**
 * Handles the disconnection of a user.
 * @param socket 
 */
function onDisconnect(socket) {
    // Log that a user has left
    console.log('A user disconnected: ' + server.usernames[socket.id] + ', ID: ' + socket.id);

    // Remove from the server's socket and username maps
    delete server.sockets[socket.id];
    delete server.usernames[socket.id];

    // Decrement number of players
    numPlayers--;

    // Wait a moment, then update the player list for all clients
    setTimeout(() => {
        server.emit('update players', {
            usernames: Object.values(server.usernames),
            vip: server.usernames[vipPlayer]
        });
    }, 25);

}

/**
 * If the VIP player tells the server to start the game, it responds by
 * creating a Field object and Players for each player.
 * @param socket 
 */
function onStart(socket) {
    if (socket.id == vipPlayer && numPlayers >= 3) {
        // Print details about connected players as we start
        printConnections();
        // Set lobby to false, onConnection needs this to reject later attempts
        lobby = false;
        // Move to the next phase of the game
        nextScene();
    }
}

function printConnections() {
    // Print the status of players connected
    console.log("\n# of Players: ", numPlayers);
    console.log("VIP: " + server.usernames[vipPlayer] + ', ' + vipPlayer);
    console.log(server.usernames, '\n');
}

function testForRejection(socket) {
    // Get the user's preferred username
    let username = socket.handshake.query.username;
    let rejectMessage = null;

    console.log(Object.values(server.usernames));
    console.log(username);

    // User rejection conditions
    if (!lobby) {
        // Reject the user if we've already left the lobby
        rejectMessage = 'Server not accepting players.';
    }
    else if (numPlayers >= 5) {
        // Reject the user if there's already 5 players
        rejectMessage = 'Server is full.';
    } else if (Object.values(server.usernames).includes(username)) {
        console.log("Name duplication!");
        // Reject the user if their name is already taken
        rejectMessage = 'Username is already in use.';
    }

    if (rejectMessage != null) {
        socket.emit('reject connection', rejectMessage);
        // Log that a user has been rejected
        console.log('User rejected:', socket.id, ' | Reason:', rejectMessage);
        // Disconnect the user
        socket.disconnect(true);
        return true;
    }
    return false;
}

function nextScene() {
    require('./Play');
}