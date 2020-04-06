
/**
 *  Events Reference *
 * * * * * * * * * * *
 * 
 *  Server Emits |
 * --------------|
 * 'start game': sent once the server is ready to start the game, clients
 *               should change scenes at this point.
 *     Sent to: all clients
 *     Argument: a "clean" field object containing general player information
 *               {
 *                   players: {
 *                       username: {
 *                           username: string...,
 *                           character: Character...,
 *                           health: number...,
 *                           hand: number...
 *                       }
 *                   }
 *               }
 * 
 * 'your player': sent shortly after the user has started the game
 *     Sent to: client associated with the player object
 *     Argument: player object as defined in Player class 
 * 
 * 'sync': sent periodically for syncing
 *     Sent to: each client, but individually 1 at a time
 *     Argument: {
 *                   field: client safe field object,
 *                   player: the client's player object
 *               }
 * 
 *  Server Listens For |
 * --------------------|
 * 
 */

const server = require('../SocketServer');
const Field = require('../game/Field');

// Create a game field to pass to the players
var field = new Field(Object.values(server.usernames));

// Start the match
startMatch();

function startMatch() {
    // Tell the clients to start the game with the given field
    server.emit('start game', field.getCliField());

    // Wait a moment for clients to transition scenes
    setTimeout(() => {
        for (let id of Object.keys(server.sockets)) {
            // Send each client their player object
            server.emitTo(id, 'your player', field.players[server.usernames[id]]);
        }
        setTimeout(() => {
            // Deal cards to all the players
            field.dealHands(Object.values(server.usernames));
            // Start the first turn of the game
            field.nextTurn();
        }, 25);
    }, 25);

}

// As long as we're running the Play scene, keep sending field updates
// to the console and keep syncing with the clients.
setInterval(() => {
    field.print.bind(field);

    // Synchronize
    for (let id of Object.keys(server.sockets)) {
        server.emitTo(id, 'sync', {
            field: field.getCliField(),
            player: field.players[server.usernames[id]]
        });
    }

    // Check for victory conditions
    let necromancer = null;
    let grandmaster = null;
    for (let [name, player] of Object.entries(field.players)) {
        if (player.role.name == "Necromancer") {
            necromancer = name;
        }
        if (player.role.name == "Grandmaster") {
            grandmaster = name;
        }
    }
    if (field.players[necromancer].health <= 0) {
        winners = [];
        for (let name of Object.keys(field.players)) {
            if (name != necromancer) {
                winners.push(name);
            }
        }
        server.emit('game over', winners);
    } else if (field.players[grandmaster].health <= 0) {
        winners = [];
        winners.push(necromancer);
        server.emit('game over', winners);
    }

}, 1000);