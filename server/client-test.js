// Temporary for testing!!!
// Create a client connection.
const client = require('../client/SocketClient');
client.connectTo('Jeremy', 'localhost', 3000);
client.emit('greeting');