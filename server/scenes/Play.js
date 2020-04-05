const server = require('../SocketServer');
const Field = require('../game/Field');

// Create a game field to pass to the players
var field = new Field(Object.values(server.usernames));
// Tell the clients to start the game with the given field
server.emit('start game', field.getCliField());