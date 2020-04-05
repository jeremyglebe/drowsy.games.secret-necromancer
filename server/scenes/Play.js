const server = require('../SocketServer');
const Field = require('../game/Field');

// Create a game field to pass to the players
var field = new Field(Object.values(server.usernames));
// Tell the clients to start the game with the given field
server.emit('start game', field.getCliField());

// Emit each play their full player object
setTimeout(() => {
    for (let id of Object.keys(server.sockets)) {
        server.emitTo(id, 'your player', field.players[server.usernames[id]]);
    }
}, 25);

// As long as we're running the Play scene, keep sending field updates
// to the console. Server admin should be able to monitor progress.
setInterval(field.print.bind(field), 5000);